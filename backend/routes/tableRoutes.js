import express from "express";
import {
  addTable,
  getTable,
  getTables,
  removeTable,
} from "../controllers/tableController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(requireAuth);

router.get("/", getTables);
router.get("/:id", getTable);
router.post("/", addTable);
router.delete("/:id", removeTable);

export default router;
