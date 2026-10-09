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

    const entries = await prisma.journalEntry.findMany({
      where: {
        createdAt: {
          gte: new Date(parsed.data.from),
          lt: new Date(parsed.data.to),
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    res.json(entries);
  } catch (error) {
    console.error(error);
    res.status(500).json({
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

    const rows = await prisma.journalEntry.findMany({
      where: {
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

    res.json(rows.map((row) => row.createdAt.toISOString()));
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to get journal activity",
    });
  }
}

export async function getFirstJournalActivity(
  _req: Request,
  res: Response,
) {
  try {
    const row = await prisma.journalEntry.findFirst({
      select: {
        createdAt: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    res.json(row?.createdAt.toISOString() ?? null);
  } catch (error) {
    console.error(error);
    res.status(500).json({
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

    const id = parsed.data;

    const entry = await prisma.journalEntry.findUnique({
      where: {
        id,
      },
    });

    if (!entry) {
      return res.status(404).json({
        error: "Journal entry not found",
      });
    }

    res.json(entry);
  } catch (error) {
    console.error(error);
    res.status(500).json({
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

    const { content } = parsed.data;

    const entry = await prisma.journalEntry.create({
      data: {
        content,
      },
    });

    res.status(201).json(entry);
  } catch (error) {
    console.error(error);
    res.status(500).json({
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

    const id = parsedId.data;
    const { content } = parsedBody.data;

    const entry = await prisma.journalEntry.update({
      where: {
        id,
      },
      data: {
        content,
      },
    });

    res.json(entry);
  } catch (error) {
    if (isRecordNotFound(error)) {
      return res.status(404).json({
        error: "Journal entry not found",
      });
    }
    console.error(error);
    res.status(500).json({
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

    const id = parsed.data;

    await prisma.journalEntry.delete({
      where: {
        id,
      },
    });

    res.status(204).send();
  } catch (error) {
    if (isRecordNotFound(error)) {
      return res.status(404).json({
        error: "Journal entry not found",
      });
    }
    console.error(error);
    res.status(500).json({
      error: "Failed to delete journal entry",
    });
  }
}