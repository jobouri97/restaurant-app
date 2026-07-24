import pool from "../src/db.js";

export const findTablesByUserId = async (userId) => {
  const result = await pool.query(
    `SELECT id, user_id, number, qr_code
     FROM restaurant_tables
     WHERE user_id = $1
     ORDER BY number`,
    [userId],
  );

  return result.rows;
};

export const findTableById = async (id, userId) => {
  const result = await pool.query(
    `SELECT id, user_id, number, qr_code
     FROM restaurant_tables
     WHERE id = $1 AND user_id = $2`,
    [id, userId],
  );

  return result.rows[0] || null;
};

export const findTableByQrCode = async (qrCode) => {
  const result = await pool.query(
    `SELECT t.id, t.user_id, t.number, t.qr_code, u.name AS restaurant_name,
            u.public_code
     FROM restaurant_tables t
     JOIN users u ON u.id = t.user_id
     WHERE t.qr_code = $1`,
    [qrCode],
  );

  return result.rows[0] || null;
};

export const createTable = async ({ userId, number, qrCode }) => {
  const result = await pool.query(
    `INSERT INTO restaurant_tables (user_id, number, qr_code)
     VALUES ($1, $2, $3)
     RETURNING id, user_id, number, qr_code`,
    [userId, number, qrCode],
  );

  return result.rows[0];
};

export const deleteTableById = async (id, userId) => {
  const result = await pool.query(
    `DELETE FROM restaurant_tables
     WHERE id = $1 AND user_id = $2
     RETURNING id`,
    [id, userId],
  );

  return result.rows[0] || null;
};
