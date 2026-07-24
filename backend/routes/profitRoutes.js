import express from "express";
import { getProfits } from "../controllers/profitController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(requireAuth);
router.get("/", getProfits);

export default router;
