import "dotenv/config";
import express from "express";
import cors from "cors";
import journalRoutes from "./routes/journalRoutes.js";
import habitRoutes from "./routes/habitRoutes.js";

const CLIENT_URL = process.env.CLIENT_URL ?? "http://localhost:5173";

export const app = express();

app.use(cors({ origin: CLIENT_URL }));
app.use(express.json());
app.use("/api/journal", journalRoutes);
app.use("/api/habits", habitRoutes);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});
