import { Router } from "express";

import {
  getMe,
  login,
  logout,
  register,
} from "../controllers/authController.js";
import { requireAuth } from "../middleware/requireAuth.js";

const authRoutes = Router();

authRoutes.get("/me", requireAuth, getMe);
authRoutes.post("/login", login);
authRoutes.post("/register", register);
authRoutes.post("/logout", logout);

export default authRoutes;