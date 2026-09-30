import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import type { AnyARecord } from "node:dns";

export async function getJournalDates(
  req: Request,
  res: Response,
) {
  try {
    const entries = await (prisma as any).journalEntry.findMany({
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

    const entry = await (prisma as any).journalEntry.findUnique({
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
    const { date, content } = req.body;

    if (typeof date !== "string") {
      return res.status(400).json({
        error: "Date is required",
      });
    }

    if (typeof content !== "string") {
      return res.status(400).json({
        error: "Content is required",
      });
    }

    if (content.trim().length === 0) {
      return res.status(400).json({
        error: "Content cannot be empty",
      });
    }

    const entry = await (prisma as any).journalEntry.create({
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
    const { content } = req.body;

    if (typeof content !== "string") {
      return res.status(400).json({
        error: "Content is required",
      });
    }

    if (content.trim().length === 0) {
      return res.status(400).json({
        error: "Content cannot be empty",
      });
    }

    const entry = await (prisma as any).journalEntry.update({
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