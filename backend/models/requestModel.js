import crypto from "node:crypto";
import pool from "../src/db.js";

export const REQUEST_STATUSES = [
  "pending",
  "accepted",
  "preparing",
  "ready",
  "completed",
  "cancelled",
];

const getRequestById = async (client, requestId, userId = null) => {
  const requestResult = await client.query(
    `SELECT
       r.id,
       r.user_id,
       r.table_id,
       t.number AS table_number,
       r.created_at,
       r.price,
       r.status,
       r.status_changed_at,
       r.tracking_token
     FROM requests r
     JOIN restaurant_tables t ON t.id = r.table_id
     WHERE r.id = $1
       AND ($2::bigint IS NULL OR r.user_id = $2)
       AND (
         r.status NOT IN ('completed', 'cancelled')
         OR r.status_changed_at > NOW() - INTERVAL '2 minutes'
       )`,
    [requestId, userId],
  );
  const request = requestResult.rows[0];

  if (!request) return null;

  const itemsResult = await client.query(
    `SELECT
       ri.id,
       ri.item_id,
       i.name,
       ri.price,
       ri.qty,
       rii.id AS selection_id,
       rii.ingredient_name,
       rii.option_name
     FROM requested_items ri
     JOIN items i ON i.id = ri.item_id
     LEFT JOIN requested_items_ingredients rii
       ON rii.requested_item_id = ri.id
     WHERE ri.request_id = $1
     ORDER BY ri.id, rii.id`,
    [requestId],
  );
  const itemsById = new Map();

  for (const row of itemsResult.rows) {
    if (!itemsById.has(row.id)) {
      itemsById.set(row.id, {
        id: row.id,
        itemId: row.item_id,
        name: row.name,
        price: row.price,
        qty: row.qty,
        ingredients: [],
      });
    }

    if (row.selection_id) {
      itemsById.get(row.id).ingredients.push({
        ingredientName: row.ingredient_name,
        optionName: row.option_name,
      });
    }
  }

  return { ...request, items: [...itemsById.values()] };
};

const loadMenuItem = async (client, itemId, restaurantUserId) => {
  const itemResult = await client.query(
    `SELECT i.id, i.name, i.price
     FROM items i
     JOIN categories c ON c.id = i.category_id
     WHERE i.id = $1
       AND c.user_id = $2
       AND i.is_available = TRUE`,
    [itemId, restaurantUserId],
  );
  const item = itemResult.rows[0];

  if (!item) return null;

  const choicesResult = await client.query(
    `SELECT
       ing.id AS ingredient_id,
       ing.name AS ingredient_name,
       opt.id AS option_id,
       opt.option_name,
       opt.is_default
     FROM ingredients ing
     LEFT JOIN ingredient_options opt ON opt.ingredient_id = ing.id
     WHERE ing.item_id = $1
     ORDER BY ing.id, opt.id`,
    [itemId],
  );
  const ingredients = new Map();

  for (const row of choicesResult.rows) {
    if (!ingredients.has(String(row.ingredient_id))) {
      ingredients.set(String(row.ingredient_id), {
        id: String(row.ingredient_id),
        name: row.ingredient_name,
        options: new Map(),
        defaultOption: null,
      });
    }

    if (row.option_id) {
      const ingredient = ingredients.get(String(row.ingredient_id));
      const option = {
        id: String(row.option_id),
        name: row.option_name,
      };
      ingredient.options.set(option.id, option);
      if (row.is_default) ingredient.defaultOption = option;
    }
  }

  return { ...item, ingredients };
};

const resolveSelections = (menuItem, submittedSelections) => {
  const submittedByIngredient = new Map();

  for (const selection of submittedSelections) {
    const ingredient = menuItem.ingredients.get(selection.ingredientId);
    const option = ingredient?.options.get(selection.optionId);

    if (!ingredient || !option) {
      const error = new Error(
        `An ingredient option is invalid for item "${menuItem.name}"`,
      );
      error.statusCode = 400;
      throw error;
    }
    if (submittedByIngredient.has(ingredient.id)) {
      const error = new Error(
        `Ingredient "${ingredient.name}" was selected more than once`,
      );
      error.statusCode = 400;
      throw error;
    }
    submittedByIngredient.set(ingredient.id, option);
  }

  const resolved = [];
  for (const ingredient of menuItem.ingredients.values()) {
    if (ingredient.options.size === 0) continue;

    const option =
      submittedByIngredient.get(ingredient.id) || ingredient.defaultOption;
    if (!option) {
      const error = new Error(
        `A choice is required for ingredient "${ingredient.name}"`,
      );
      error.statusCode = 400;
      throw error;
    }
    resolved.push({
      ingredientName: ingredient.name,
      optionName: option.name,
    });
  }

  return resolved;
};

export const createRequest = async ({ qrCode, items }) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const tableResult = await client.query(
      `SELECT id, user_id
       FROM restaurant_tables
       WHERE qr_code = $1
       FOR SHARE`,
      [qrCode],
    );
    const table = tableResult.rows[0];

    if (!table) {
      const error = new Error("Table QR code is invalid");
      error.statusCode = 404;
      throw error;
    }

    const lines = [];
    let totalCents = 0;
    for (const submittedItem of items) {
      const menuItem = await loadMenuItem(
        client,
        submittedItem.itemId,
        table.user_id,
      );
      if (!menuItem) {
        const error = new Error(
          "An item is unavailable or does not belong to this restaurant",
        );
        error.statusCode = 400;
        throw error;
      }

      const unitPriceCents = Math.round(Number(menuItem.price) * 100);
      totalCents += unitPriceCents * submittedItem.qty;
      if (totalCents > 9999999999) {
        const error = new Error("Request total exceeds the supported limit");
        error.statusCode = 400;
        throw error;
      }

      lines.push({
        ...submittedItem,
        unitPrice: (unitPriceCents / 100).toFixed(2),
        selections: resolveSelections(menuItem, submittedItem.ingredients),
      });
    }

    const requestResult = await client.query(
      `INSERT INTO requests (
         user_id,
         table_id,
         price,
         status,
         tracking_token
       )
       VALUES ($1, $2, $3, 'pending', $4)
       RETURNING id`,
      [
        table.user_id,
        table.id,
        (totalCents / 100).toFixed(2),
        crypto.randomBytes(24).toString("base64url"),
      ],
    );
    const requestId = requestResult.rows[0].id;

    for (const line of lines) {
      const requestedItemResult = await client.query(
        `INSERT INTO requested_items (request_id, item_id, price, qty)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [requestId, line.itemId, line.unitPrice, line.qty],
      );
      const requestedItemId = requestedItemResult.rows[0].id;

      for (const selection of line.selections) {
        await client.query(
          `INSERT INTO requested_items_ingredients (
             requested_item_id,
             ingredient_name,
             option_name
           )
           VALUES ($1, $2, $3)`,
          [
            requestedItemId,
            selection.ingredientName,
            selection.optionName,
          ],
        );
      }
    }

    const request = await getRequestById(client, requestId);
    await client.query("COMMIT");
    return request;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const findRequestsByUserId = async (userId, status = null) => {
  const result = await pool.query(
    `SELECT
       r.id,
       r.table_id,
       t.number AS table_number,
       r.created_at,
       r.price,
       r.status,
       r.status_changed_at,
       COALESCE(SUM(ri.qty), 0)::integer AS item_count
     FROM requests r
     JOIN restaurant_tables t ON t.id = r.table_id
     LEFT JOIN requested_items ri ON ri.request_id = r.id
     WHERE r.user_id = $1
       AND ($2::varchar IS NULL OR r.status = $2)
       AND (
         r.status NOT IN ('completed', 'cancelled')
         OR r.status_changed_at > NOW() - INTERVAL '2 minutes'
       )
     GROUP BY r.id, t.number
     ORDER BY r.created_at DESC`,
    [userId, status],
  );

  return result.rows;
};

export const findRequestById = (requestId, userId) =>
  getRequestById(pool, requestId, userId);

export const findRequestByTrackingToken = async (trackingToken) => {
  const result = await pool.query(
    `SELECT id FROM requests WHERE tracking_token = $1`,
    [trackingToken],
  );

  if (!result.rows[0]) return null;
  return getRequestById(pool, result.rows[0].id);
};

export const updateRequestStatus = async ({
  requestId,
  userId,
  status,
}) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const result = await client.query(
      `UPDATE requests
       SET status = $1::varchar,
           status_changed_at = CASE
             WHEN status IS DISTINCT FROM $1::varchar THEN NOW()
             ELSE status_changed_at
           END
       WHERE id = $2 AND user_id = $3
       RETURNING id, user_id, price`,
      [status, requestId, userId],
    );
    const request = result.rows[0];

    if (!request) {
      await client.query("ROLLBACK");
      return null;
    }

    if (status === "completed") {
      await client.query(
        `INSERT INTO profits (user_id, request_id, price)
         VALUES ($1, $2, $3)
         ON CONFLICT (request_id) DO NOTHING`,
        [request.user_id, request.id, request.price],
      );
    }

    const updatedRequest = await getRequestById(client, requestId, userId);
    await client.query("COMMIT");
    return updatedRequest;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
