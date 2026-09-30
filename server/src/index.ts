import "dotenv/config";
import express from "express";
import cors from "cors";
import journalRoutes from "./routes/journalRoutes.js";
import habitRoutes from "./routes/habitRoutes.js";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use("/api/journal", journalRoutes);
app.use("/api/habits", habitRoutes);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});