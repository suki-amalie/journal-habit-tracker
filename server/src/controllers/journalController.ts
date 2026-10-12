import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { isRecordNotFound } from "../lib/prismaErrors.js";
import {
  createJournalEntrySchema,
  updateJournalEntrySchema,
  journalEntryIdSchema,
  journalRangeQuerySchema,
  formatZodError,
} from "../validation/schemas.js";

export async function getJournalEntries(
  req: Request,
  res: Response,
) {
  try {
    const parsed = journalRangeQuerySchema.safeParse(req.query);

    if (!parsed.success) {
      return res.status(400).json({
        error: formatZodError(parsed.error),
      });
    }

    const userId = req.user!.id;

    const entries = await prisma.journalEntry.findMany({
      where: {
        userId,
        createdAt: {
          gte: new Date(parsed.data.from),
          lt: new Date(parsed.data.to),
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return res.json(entries);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Failed to get journal entries",
    });
  }
}

// Returns timestamps only so the client can bucket them by local day.
export async function getJournalActivity(
  req: Request,
  res: Response,
) {
  try {
    const parsed = journalRangeQuerySchema.safeParse(req.query);

    if (!parsed.success) {
      return res.status(400).json({
        error: formatZodError(parsed.error),
      });
    }

    const userId = req.user!.id;

    const rows = await prisma.journalEntry.findMany({
      where: {
        userId,
        createdAt: {
          gte: new Date(parsed.data.from),
          lt: new Date(parsed.data.to),
        },
      },
      select: {
        createdAt: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return res.json(
      rows.map((row) => row.createdAt.toISOString()),
    );
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Failed to get journal activity",
    });
  }
}

export async function getFirstJournalActivity(
  req: Request,
  res: Response,
) {
  try {
    const userId = req.user!.id;

    const row = await prisma.journalEntry.findFirst({
      where: {
        userId,
      },
      select: {
        createdAt: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return res.json(row?.createdAt.toISOString() ?? null);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Failed to get the first journal activity",
    });
  }
}

export async function getJournalEntry(
  req: Request,
  res: Response,
) {
  try {
    const parsed = journalEntryIdSchema.safeParse(req.params.id);

    if (!parsed.success) {
      return res.status(400).json({
        error: formatZodError(parsed.error),
      });
    }

    const entry = await prisma.journalEntry.findFirst({
      where: {
        id: parsed.data,
        userId: req.user!.id,
      },
    });

    if (!entry) {
      return res.status(404).json({
        error: "Journal entry not found",
      });
    }

    return res.json(entry);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Failed to get journal entry",
    });
  }
}

export async function createJournalEntry(
  req: Request,
  res: Response,
) {
  try {
    const parsed = createJournalEntrySchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        error: formatZodError(parsed.error),
      });
    }

    const entry = await prisma.journalEntry.create({
      data: {
        content: parsed.data.content,
        userId: req.user!.id,
      },
    });

    return res.status(201).json(entry);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Failed to create journal entry",
    });
  }
}

export async function updateJournalEntry(
  req: Request,
  res: Response,
) {
  try {
    const parsedId = journalEntryIdSchema.safeParse(req.params.id);

    if (!parsedId.success) {
      return res.status(400).json({
        error: formatZodError(parsedId.error),
      });
    }

    const parsedBody = updateJournalEntrySchema.safeParse(req.body);

    if (!parsedBody.success) {
      return res.status(400).json({
        error: formatZodError(parsedBody.error),
      });
    }

    const entry = await prisma.journalEntry.update({
      where: {
        id: parsedId.data,
        userId: req.user!.id,
      },
      data: {
        content: parsedBody.data.content,
      },
    });

    return res.json(entry);
  } catch (error) {
    if (isRecordNotFound(error)) {
      return res.status(404).json({
        error: "Journal entry not found",
      });
    }

    console.error(error);
    return res.status(500).json({
      error: "Failed to update journal entry",
    });
  }
}

export async function deleteJournalEntry(
  req: Request,
  res: Response,
) {
  try {
    const parsed = journalEntryIdSchema.safeParse(req.params.id);

    if (!parsed.success) {
      return res.status(400).json({
        error: formatZodError(parsed.error),
      });
    }

    await prisma.journalEntry.delete({
      where: {
        id: parsed.data,
        userId: req.user!.id,
      },
    });

    return res.status(204).send();
  } catch (error) {
    if (isRecordNotFound(error)) {
      return res.status(404).json({
        error: "Journal entry not found",
      });
    }

    console.error(error);
    return res.status(500).json({
      error: "Failed to delete journal entry",
    });
  }
}
