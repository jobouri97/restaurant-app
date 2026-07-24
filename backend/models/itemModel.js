import pool from "../src/db.js";

const itemColumns = `
  i.id,
  i.category_id,
  i.name,
  i.description,
  i.image_url,
  i.price,
  i.is_available
`;

const buildNestedItem = async (client, item) => {
  if (!item) {
    return null;
  }

  const result = await client.query(
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
    [item.id],
  );

  const ingredientsById = new Map();

  for (const row of result.rows) {
    if (!ingredientsById.has(row.ingredient_id)) {
      ingredientsById.set(row.ingredient_id, {
        id: row.ingredient_id,
        name: row.ingredient_name,
        options: [],
      });
    }

    if (row.option_id) {
      ingredientsById.get(row.ingredient_id).options.push({
        id: row.option_id,
        optionName: row.option_name,
        isDefault: row.is_default,
      });
    }
  }

  return {
    ...item,
    ingredients: [...ingredientsById.values()],
  };
};

export const findItemsByUserId = async (userId) => {
  const result = await pool.query(
    `SELECT ${itemColumns}
     FROM items i
     JOIN categories c ON c.id = i.category_id
     WHERE c.user_id = $1
     ORDER BY i.id`,
    [userId],
  );

  return Promise.all(result.rows.map((item) => buildNestedItem(pool, item)));
};

export const findItemById = async (id, userId) => {
  const result = await pool.query(
    `SELECT ${itemColumns}
     FROM items i
     JOIN categories c ON c.id = i.category_id
     WHERE i.id = $1 AND c.user_id = $2`,
    [id, userId],
  );

  return buildNestedItem(pool, result.rows[0] || null);
};

const replaceIngredients = async (client, itemId, ingredients) => {
  await client.query("DELETE FROM ingredients WHERE item_id = $1", [itemId]);

  for (const ingredient of ingredients) {
    const ingredientResult = await client.query(
      `INSERT INTO ingredients (item_id, name)
       VALUES ($1, $2)
       RETURNING id`,
      [itemId, ingredient.name],
    );
    const ingredientId = ingredientResult.rows[0].id;

    for (const option of ingredient.options) {
      await client.query(
        `INSERT INTO ingredient_options (
           ingredient_id,
           option_name,
           is_default
         )
         VALUES ($1, $2, $3)`,
        [ingredientId, option.optionName, option.isDefault],
      );
    }
  }
};

export const createItem = async ({ userId, categoryId, name, description, imageUrl, price, isAvailable, ingredients, }) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const result = await client.query(
      `INSERT INTO items (
         category_id,
         name,
         description,
         image_url,
         price,
         is_available
       )
       SELECT $1, $2, $3, $4, $5, $6
       FROM categories
       WHERE id = $1 AND user_id = $7
       RETURNING id, category_id, name, description, image_url, price, is_available`,
      [categoryId, name, description, imageUrl, price, isAvailable, userId],
    );
    const item = result.rows[0];

    if (!item) {
      await client.query("ROLLBACK");
      return null;
    }

    await replaceIngredients(client, item.id, ingredients);
    const nestedItem = await buildNestedItem(client, item);
    await client.query("COMMIT");
    return nestedItem;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const updateItemById = async ({ id, userId, categoryId, name, description, imageUrl, price, isAvailable, ingredients, }) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const result = await client.query(
      `UPDATE items i
       SET category_id = $1,
           name = $2,
           description = $3,
           image_url = $4,
           price = $5,
           is_available = $6
       WHERE i.id = $7
         AND EXISTS (
           SELECT 1 FROM categories current_category
           WHERE current_category.id = i.category_id
             AND current_category.user_id = $8
         )
         AND EXISTS (
           SELECT 1 FROM categories new_category
           WHERE new_category.id = $1
             AND new_category.user_id = $8
         )
       RETURNING id, category_id, name, description, image_url, price, is_available`,
      [categoryId, name, description, imageUrl, price, isAvailable, id, userId],
    );
    const item = result.rows[0];

    if (!item) {
      await client.query("ROLLBACK");
      return null;
    }

    await replaceIngredients(client, item.id, ingredients);
    const nestedItem = await buildNestedItem(client, item);
    await client.query("COMMIT");
    return nestedItem;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const deleteItemById = async (id, userId) => {
  const result = await pool.query(
    `DELETE FROM items i
     WHERE i.id = $1
       AND EXISTS (
         SELECT 1
         FROM categories c
         WHERE c.id = i.category_id AND c.user_id = $2
       )
     RETURNING id`,
    [id, userId],
  );

  return result.rows[0] || null;
};
