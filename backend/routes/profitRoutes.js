import express from "express";
import {
  getProfitDetails,
  getProfits,
} from "../controllers/profitController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(requireAuth);
router.get("/", getProfits);
router.get("/:id", getProfitDetails);

export default router;
