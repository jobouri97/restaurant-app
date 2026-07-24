import express from "express";
import {
  changeRequestStatus,
  getRequest,
  getRequests,
} from "../controllers/requestController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(requireAuth);
router.get("/", getRequests);
router.get("/:id", getRequest);
router.patch("/:id/status", changeRequestStatus);

export default router;
