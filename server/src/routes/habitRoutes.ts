import { Router } from "express";

import {
  getHabits,
  createHabit,
  updateHabit,
  deleteHabit,
  createHabitCompletion,
  deleteHabitCompletion,
  getHabitCompletions,
  getAllHabitCompletions,
} from "../controllers/habitController.js";

const router = Router();

router.get("/", getHabits);
router.post("/", createHabit);

// Must be registered before the "/:id" routes.
router.get("/completions", getAllHabitCompletions);

router.patch("/:id", updateHabit);
router.delete("/:id", deleteHabit);

router.post("/:id/completions", createHabitCompletion);
router.get("/:id/completions", getHabitCompletions);
router.delete("/:id/completions/:date", deleteHabitCompletion);

export default router;