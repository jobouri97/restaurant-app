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
