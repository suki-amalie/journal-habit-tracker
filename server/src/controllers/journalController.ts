import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import {
  createJournalEntrySchema,
  updateJournalEntrySchema,
  dateStringSchema,
  formatZodError,
} from "../validation/schemas.js";

export async function getJournalDates(
  req: Request,
  res: Response,
) {
  try {
    const entries = await prisma.journalEntry.findMany({
      select: {
        date: true,
      },
      orderBy: {
        date: "asc",
      },
    });

    res.json(
      entries.map((entry: { date: Date }) => entry.date.toISOString().slice(0, 10)),
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to get journal entries",
    });
  }
}

export async function getJournalEntry(
  req: Request,
  res: Response,
) {
  try {
    const { date } = req.params;

    const dateParsed = dateStringSchema.safeParse(date);

    if (!dateParsed.success) {
      return res.status(400).json({
        error: formatZodError(dateParsed.error),
      });
    }

    const entry = await prisma.journalEntry.findUnique({
      where: {
        date: new Date(`${date}T00:00:00.000Z`),
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

    const { date, content } = parsed.data;

    const entry = await prisma.journalEntry.create({
      data: {
        date: new Date(`${date}T00:00:00.000Z`),
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
    const { date } = req.params;

    const dateParsed = dateStringSchema.safeParse(date);

    if (!dateParsed.success) {
      return res.status(400).json({
        error: formatZodError(dateParsed.error),
      });
    }

    const parsed = updateJournalEntrySchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        error: formatZodError(parsed.error),
      });
    }

    const { content } = parsed.data;

    const entry = await prisma.journalEntry.update({
      where: {
        date: new Date(`${date}T00:00:00.000Z`),
      },
      data: {
        content,
      },
    });

    res.json(entry);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to update journal entry",
    });
  }
}