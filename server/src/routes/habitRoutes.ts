import { Router } from "express";

import {
  getHabits,
  createHabit,
  createHabitCompletion,
  deleteHabitCompletion,
  getHabitCompletions,
} from "../controllers/habitController.js";

const router = Router();

router.get("/", getHabits);
router.post("/", createHabit);

router.post("/:id/completions", createHabitCompletion);
router.get("/:id/completions", getHabitCompletions);
router.delete("/:id/completions/:date", deleteHabitCompletion);

export default router;