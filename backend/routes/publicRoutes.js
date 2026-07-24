import express from "express";
import {
    getPublicRestaurant,
    getPublicTable,
} from "../controllers/publicController.js";

const router = express.Router();

router.get("/restaurants/:publicCode", getPublicRestaurant);
router.get("/tables/:qrCode", getPublicTable);

export default router;
