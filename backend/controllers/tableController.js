import crypto from "node:crypto";
import {
  createTable,
  deleteTableById,
  findTableById,
  findTablesByUserId,
} from "../models/tableModel.js";

const parseTableNumber = (value) => {
  const number = Number(value);
  return Number.isSafeInteger(number) && number > 0 ? number : null;
};

const serializeTable = (table, req) => ({
  ...table,
  qrUrl: `${req.protocol}://${req.get("host")}/api/public/tables/${encodeURIComponent(table.qr_code)}`,
});

export const getTables = async (req, res, next) => {
  try {
    const tables = await findTablesByUserId(req.auth.userId);
    return res.json({
      tables: tables.map((table) => serializeTable(table, req)),
    });
  } catch (error) {
    next(error);
  }
};

export const getTable = async (req, res, next) => {
  try {
    const table = await findTableById(req.params.id, req.auth.userId);

    if (!table) {
      return res.status(404).json({ message: "Table not found" });
    }

    return res.json({ table: serializeTable(table, req) });
  } catch (error) {
    next(error);
  }
};

export const addTable = async (req, res, next) => {
  try {
    const number = parseTableNumber(req.body.number);

    if (!number) {
      return res.status(400).json({
        message: "Table number must be a positive integer",
      });
    }

    const table = await createTable({
      userId: req.auth.userId,
      number,
      qrCode: crypto.randomBytes(24).toString("base64url"),
    });

    return res.status(201).json({
      table: serializeTable(table, req),
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        message: "This table number already exists",
      });
    }

    next(error);
  }
};

export const removeTable = async (req, res, next) => {
  try {
    const table = await deleteTableById(req.params.id, req.auth.userId);

    if (!table) {
      return res.status(404).json({ message: "Table not found" });
    }

    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};
