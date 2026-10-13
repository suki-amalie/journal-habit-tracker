import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import journalRoutes from "./routes/journalRoutes.js";
import habitRoutes from "./routes/habitRoutes.js";
import authRoutes from "./routes/authRoutes.js";

const CLIENT_URL = process.env.CLIENT_URL ?? "http://localhost:5173";

export const app = express();

app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/journal", journalRoutes);
app.use("/api/habits", habitRoutes);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});
