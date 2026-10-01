import { z } from "zod";

export const HABIT_NAME_MAX_LENGTH = 100;
export const HABIT_DESCRIPTION_MAX_LENGTH = 500;
export const JOURNAL_CONTENT_MAX_LENGTH = 20_000;

export const dateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format");

export const createHabitSchema = z.object({
  name: z.string().trim().min(1, "Habit name is required").max(HABIT_NAME_MAX_LENGTH),
  description: z
    .string()
    .trim()
    .max(HABIT_DESCRIPTION_MAX_LENGTH)
    .nullable()
    .optional(),
});

export const createHabitCompletionSchema = z.object({
  date: dateStringSchema,
});

export const habitCompletionsQuerySchema = z.object({
  from: dateStringSchema.optional(),
  to: dateStringSchema.optional(),
});

export const createJournalEntrySchema = z.object({
  date: dateStringSchema,
  content: z.string().trim().min(1, "Content cannot be empty").max(JOURNAL_CONTENT_MAX_LENGTH),
});

export const updateJournalEntrySchema = z.object({
  content: z.string().trim().min(1, "Content cannot be empty").max(JOURNAL_CONTENT_MAX_LENGTH),
});

// Formats the first Zod issue into a short, user-facing message.
export function formatZodError(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Invalid request";
}
