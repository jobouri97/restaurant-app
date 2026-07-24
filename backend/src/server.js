import "dotenv/config";
import express from "express";
import cors from "cors";
import pool from "./db.js";
import authRoutes from "../routes/authRoutes.js";
import categoryRoutes from "../routes/categoryRoutes.js";
import itemRoutes from "../routes/itemRoutes.js";
import publicRoutes from "../routes/publicRoutes.js";

const app = express();

app.use(
    cors({
        origin: process.env.FRONTEND_URL,
    }),
);
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/public", publicRoutes);

app.get("/api/health", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW() AS database_time");

        res.json({
            status: "ok",
            databaseTime: result.rows[0].database_time,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            status: "error",
            message: "Database connection failed",
        });
    }
});

const port = process.env.PORT || 5000;

app.use((err, req, res, next) => { //Add centralized error handling
  console.error(err);

  res.status(500).json({
    message: "Internal server error",
  });
});

app.listen(port, () => {
    console.log(`Backend running at http://localhost:${port}`);
});
