import pool from "../src/db.js";

export const findProfitsByUserId = async (userId) => {
  const result = await pool.query(
    `SELECT
       p.id,
       p.request_id,
       p.price,
       p.created_at,
       r.table_id,
       t.number AS table_number
     FROM profits p
     JOIN requests r ON r.id = p.request_id
     JOIN restaurant_tables t ON t.id = r.table_id
     WHERE p.user_id = $1
     ORDER BY p.created_at DESC`,
    [userId],
  );

  return result.rows;
};

export const findProfitDetailsById = async (profitId, userId) => {
  const profitResult = await pool.query(
    `SELECT
       p.id,
       p.request_id,
       p.price,
       p.created_at,
       t.number AS table_number
     FROM profits p
     JOIN requests r ON r.id = p.request_id
     JOIN restaurant_tables t ON t.id = r.table_id
     WHERE p.id = $1 AND p.user_id = $2`,
    [profitId, userId],
  );
  const profit = profitResult.rows[0];
  if (!profit) return null;

  const itemsResult = await pool.query(
    `SELECT
       ri.id,
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
    [profit.request_id],
  );
  const itemsById = new Map();

  for (const row of itemsResult.rows) {
    if (!itemsById.has(row.id)) {
      itemsById.set(row.id, {
        id: row.id,
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

  return { ...profit, items: [...itemsById.values()] };
};
