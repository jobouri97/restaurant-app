import express from "express";
import {
  addCategory,
  editCategory,
  getCategories,
  getCategory,
  removeCategory,
} from "../controllers/categoryController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(requireAuth);

router.get("/", getCategories);
router.get("/:id", getCategory);
router.post("/", addCategory);
router.put("/:id", editCategory);
router.delete("/:id", removeCategory);

export default router;
