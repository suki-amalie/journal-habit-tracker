import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

// GET /api/habits
export async function getHabits(
  _req: Request,
  res: Response,
) {
  try {
    const habits = await prisma.habit.findMany({
      where: {
        archivedAt: null,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    res.json(habits);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to fetch habits",
    });
  }
}

// POST /api/habits
export async function createHabit(
  req: Request,
  res: Response,
) {
  try {
    const { name, description } = req.body;

    if (!name || typeof name !== "string") {
      return res.status(400).json({
        error: "Habit name is invalid",
      });
    }

    const habit = await prisma.habit.create({
      data: {
        name,
        description,
      },
    });

    res.status(201).json(habit);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to create habit",
    });
  }
}

// POST /api/habits/:id/completions
export async function createHabitCompletion(
  req: Request,
  res: Response,
) {
  try {
    const habitId = Number(req.params.id);
    const { date } = req.body;

    if (!Number.isInteger(habitId)) {
      return res.status(400).json({
        error: "Invalid habit ID",
      });
    }

    if (!date || typeof date !== "string") {
      return res.status(400).json({
        error: "Date is required",
      });
    }

    const parsedDate = new Date(`${date}T00:00:00.000Z`);

    if (Number.isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        error: "Invalid date",
      });
    }

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    // Allow a day of slack because the client
    // may be ahead of the server's UTC date.
    today.setUTCDate(today.getUTCDate() + 1);

    if (parsedDate > today) {
      return res.status(400).json({
        error: "Cannot mark a future date as completed",
      });
    }

    const habit = await prisma.habit.findUnique({
      where: {
        id: habitId,
      },
    });

    if (!habit) {
      return res.status(404).json({
        error: "Habit not found",
      });
    }

    const completion = await prisma.habitCompletion.create({
      data: {
        habitId,
        date: parsedDate,
      },
    });

    res.status(201).json(completion);
  } catch (error: any) {
    console.error(error);

    if (error.code === "P2002") {
      return res.status(409).json({
        error: "Habit is already completed on this date",
      });
    }

    res.status(500).json({
      error: "Failed to create completion",
    });
  }
}

// DELETE /api/habits/:id/completions/:date
export async function deleteHabitCompletion(
  req: Request,
  res: Response,
) {
  try {
    const habitId = Number(req.params.id);
    const { date } = req.params;

    if (!Number.isInteger(habitId)) {
      return res.status(400).json({
        error: "Invalid habit ID",
      });
    }

    await prisma.habitCompletion.delete({
      where: {
        habitId_date: {
          habitId,
          date: new Date(`${date}T00:00:00.000Z`),
        },
      },
    });

    res.status(204).send();
  } catch (error) {
    console.error(error);

    res.status(404).json({
      error: "Completion not found",
    });
  }
}

// GET /api/habits/:id/completions
export async function getHabitCompletions(
  req: Request,
  res: Response,
) {
  try {
    const habitId = Number(req.params.id);

    if (!Number.isInteger(habitId)) {
      return res.status(400).json({
        error: "Invalid habit ID",
      });
    }

    const completions = await prisma.habitCompletion.findMany({
      where: {
        habitId,
      },
      orderBy: {
        date: "asc",
      },
    });

    res.json(completions);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to fetch completions",
    });
  }
}