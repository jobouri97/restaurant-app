import express from "express";
import {
  getCurrentUser,
  googleLogin,
  login,
  register,
} from "../controllers/authController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/google", googleLogin);
router.get("/me", requireAuth, getCurrentUser);

export default router;
