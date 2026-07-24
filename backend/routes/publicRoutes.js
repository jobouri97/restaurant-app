import express from "express";
import {
    getPublicRestaurant,
    getPublicTable,
} from "../controllers/publicController.js";
import {
  addPublicRequest,
  getPublicRequest,
} from "../controllers/requestController.js";

const router = express.Router();

router.get("/restaurants/:publicCode", getPublicRestaurant);
router.get("/tables/:qrCode", getPublicTable);
router.post("/tables/:qrCode/requests", addPublicRequest);
router.get("/requests/:trackingToken", getPublicRequest);

export default router;
