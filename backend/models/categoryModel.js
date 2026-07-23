import pool from "../src/db.js";

export const findCategoriesByUserId = async (userId) => {
  const result = await pool.query(
    `SELECT id, user_id, name, image_url
     FROM categories
     WHERE user_id = $1
     ORDER BY id`,
    [userId],
  );

  return result.rows;
};

export const findCategoryById = async (id, userId) => {
  const result = await pool.query(
    `SELECT id, user_id, name, image_url
     FROM categories
     WHERE id = $1 AND user_id = $2`,
    [id, userId],
  );

  return result.rows[0] || null;
};

export const createCategory = async ({ userId, name, imageUrl }) => {
  const result = await pool.query(
    `INSERT INTO categories (user_id, name, image_url)
     VALUES ($1, $2, $3)
     RETURNING id, user_id, name, image_url`,
    [userId, name, imageUrl],
  );

  return result.rows[0];
};

export const updateCategoryById = async ({
  id,
  userId,
  name,
  imageUrl,
}) => {
  const result = await pool.query(
    `UPDATE categories
     SET name = $1, image_url = $2
     WHERE id = $3 AND user_id = $4
     RETURNING id, user_id, name, image_url`,
    [name, imageUrl, id, userId],
  );

  return result.rows[0] || null;
};

export const deleteCategoryById = async (id, userId) => {
  const result = await pool.query(
    `DELETE FROM categories
     WHERE id = $1 AND user_id = $2
     RETURNING id`,
    [id, userId],
  );

  return result.rows[0] || null;
};
