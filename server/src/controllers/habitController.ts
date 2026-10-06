import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { isRecordNotFound, isUniqueViolation } from "../lib/prismaErrors.js";
import {
  createHabitSchema,
  updateHabitSchema,
  habitIdSchema,
  habitListQuerySchema,
  habitCompletionParamsSchema,
  createHabitCompletionSchema,
  habitCompletionsQuerySchema,
  COMPLETIONS_DEFAULT_RANGE_DAYS,
  formatZodError,
} from "../validation/schemas.js";

// GET /api/habits?status=active|archived|all (default: active)
export async function getHabits(
  req: Request,
  res: Response,
) {
  try {
    const parsed = habitListQuerySchema.safeParse(req.query);

    if (!parsed.success) {
      return res.status(400).json({
        error: formatZodError(parsed.error),
      });
    }

    const { status } = parsed.data;

    const habits = await prisma.habit.findMany({
      where:
        status === "active"
          ? { archivedAt: null }
          : status === "archived"
            ? { archivedAt: { not: null } }
            : {},
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
    const parsed = createHabitSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        error: formatZodError(parsed.error),
      });
    }

    const { name, description } = parsed.data;

    const habit = await prisma.habit.create({
      data: {
        name,
        description: description ?? null,
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

// PATCH /api/habits/:id
// Edits name/description and archives or restores the habit.
export async function updateHabit(
  req: Request,
  res: Response,
) {
  try {
    const parsedId = habitIdSchema.safeParse(req.params.id);

    if (!parsedId.success) {
      return res.status(400).json({
        error: "Invalid habit ID",
      });
    }

    const parsedBody = updateHabitSchema.safeParse(req.body);

    if (!parsedBody.success) {
      return res.status(400).json({
        error: formatZodError(parsedBody.error),
      });
    }

    const { name, description, archived } = parsedBody.data;

    const habit = await prisma.habit.update({
      where: {
        id: parsedId.data,
      },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(archived !== undefined && {
          archivedAt: archived ? new Date() : null,
        }),
      },
    });

    res.json(habit);
  } catch (error) {
    if (isRecordNotFound(error)) {
      return res.status(404).json({
        error: "Habit not found",
      });
    }

    console.error(error);

    res.status(500).json({
      error: "Failed to update habit",
    });
  }
}

// DELETE /api/habits/:id
// Permanent: completions are removed with the habit (onDelete: Cascade).
export async function deleteHabit(
  req: Request,
  res: Response,
) {
  try {
    const parsedId = habitIdSchema.safeParse(req.params.id);

    if (!parsedId.success) {
      return res.status(400).json({
        error: "Invalid habit ID",
      });
    }

    await prisma.habit.delete({
      where: {
        id: parsedId.data,
      },
    });

    res.status(204).send();
  } catch (error) {
    if (isRecordNotFound(error)) {
      return res.status(404).json({
        error: "Habit not found",
      });
    }

    console.error(error);

    res.status(500).json({
      error: "Failed to delete habit",
    });
  }
}

// POST /api/habits/:id/completions
export async function createHabitCompletion(
  req: Request,
  res: Response,
) {
  try {
    const parsedId = habitIdSchema.safeParse(req.params.id);

    if (!parsedId.success) {
      return res.status(400).json({
        error: "Invalid habit ID",
      });
    }

    const parsed = createHabitCompletionSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        error: formatZodError(parsed.error),
      });
    }

    const habitId = parsedId.data;
    const parsedDate = new Date(`${parsed.data.date}T00:00:00.000Z`);

    const tomorrow = new Date();
    tomorrow.setUTCHours(0, 0, 0, 0);

    // Completions are keyed by the client's local date, which can be a
    // day ahead of the server's UTC date, so allow one day of slack.
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

    if (parsedDate > tomorrow) {
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

    if (habit.archivedAt !== null) {
      return res.status(409).json({
        error: "Cannot complete an archived habit",
      });
    }

    const completion = await prisma.habitCompletion.create({
      data: {
        habitId,
        date: parsedDate,
      },
    });

    res.status(201).json(completion);
  } catch (error) {
    if (isUniqueViolation(error)) {
      return res.status(409).json({
        error: "Habit is already completed on this date",
      });
    }

    console.error(error);

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
    const parsed = habitCompletionParamsSchema.safeParse(req.params);

    if (!parsed.success) {
      return res.status(400).json({
        error: formatZodError(parsed.error),
      });
    }

    const { id: habitId, date } = parsed.data;

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
    if (isRecordNotFound(error)) {
      return res.status(404).json({
        error: "Completion not found",
      });
    }

    console.error(error);

    res.status(500).json({
      error: "Failed to delete completion",
    });
  }
}

// GET /api/habits/:id/completions
export async function getHabitCompletions(
  req: Request,
  res: Response,
) {
  try {
    const parsedId = habitIdSchema.safeParse(req.params.id);

    if (!parsedId.success) {
      return res.status(400).json({
        error: "Invalid habit ID",
      });
    }

    const completions = await prisma.habitCompletion.findMany({
      where: {
        habitId: parsedId.data,
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

// GET /api/habits/completions?from=&to=
export async function getAllHabitCompletions(
  req: Request,
  res: Response,
) {
  try {
    const parsed = habitCompletionsQuerySchema.safeParse(req.query);

    if (!parsed.success) {
      return res.status(400).json({
        error: formatZodError(parsed.error),
      });
    }

    const { from, to } = parsed.data;

    // Unbounded history would grow forever, so default to the last year.
    const toDate = to ?? new Date().toISOString().slice(0, 10);
    const fromDate =
      from ??
      new Date(Date.parse(toDate) - COMPLETIONS_DEFAULT_RANGE_DAYS * 86_400_000)
        .toISOString()
        .slice(0, 10);

    const completions = await prisma.habitCompletion.findMany({
      where: {
        date: {
          gte: new Date(`${fromDate}T00:00:00.000Z`),
          lte: new Date(`${toDate}T00:00:00.000Z`),
        },
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
