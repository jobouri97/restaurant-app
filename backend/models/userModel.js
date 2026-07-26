import pool from "../src/db.js";

export const findUserByEmail = async (email) => {
  const result = await pool.query(
    `SELECT id, email, name, password_hash, google_id, public_code, is_admin
     FROM users
     WHERE email = $1`,
    [email],
  );

  return result.rows[0] || null;
};

export const findUserById = async (id) => {
  const result = await pool.query(
    `SELECT id, email, name, google_id, public_code, is_admin
     FROM users
     WHERE id = $1`,
    [id],
  );

  return result.rows[0] || null;
};

export const findUserByPublicCode = async (publicCode) => {
  const result = await pool.query(
    `SELECT id, name, public_code
     FROM users
     WHERE public_code = $1`,
    [publicCode],
  );

  return result.rows[0] || null;
};

export const createUser = async ({ email, name, passwordHash, publicCode, }) => {
  const result = await pool.query(
    `INSERT INTO users (
       email,
       name,
       password_hash,
       public_code,
       is_admin
     )
     VALUES ($1, $2, $3, $4, TRUE)
     RETURNING id, email, name, public_code, is_admin`,
    [email, name, passwordHash, publicCode],
  );

  return result.rows[0];
};

export const createGoogleUser = async ({ email, name, googleId, publicCode }) => {
  const result = await pool.query(
    `INSERT INTO users (email, name, google_id, public_code, is_admin)
     VALUES ($1, $2, $3, $4, TRUE)
     RETURNING id, email, name, google_id, public_code, is_admin`,
    [email, name, googleId, publicCode],
  );
  return result.rows[0];
};

export const linkGoogleAccount = async ({ userId, googleId }) => {
  const result = await pool.query(
    `UPDATE users SET google_id = $1 WHERE id = $2
     RETURNING id, email, name, google_id, public_code, is_admin`,
    [googleId, userId],
  );
  return result.rows[0];
};

