import express from "express";
import {
  addItem,
  editItem,
  getItem,
  getItems,
  removeItem,
} from "../controllers/itemController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(requireAuth);

router.get("/", getItems);
router.get("/:id", getItem);
router.post("/", addItem);
router.put("/:id", editItem);
router.delete("/:id", removeItem);

export default router;
