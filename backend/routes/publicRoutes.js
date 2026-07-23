import express from "express";
import {
    getPublicRestaurant,
} from "../controllers/publicController.js";

const router = express.Router();

router.get("/restaurants/:publicCode", getPublicRestaurant);

export default router;