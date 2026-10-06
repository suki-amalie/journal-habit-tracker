import { z } from "zod";

export const HABIT_NAME_MAX_LENGTH = 100;

export const HABIT_DESCRIPTION_MAX_LENGTH = 500;

export const JOURNAL_CONTENT_MAX_LENGTH = 20_000;

export const JOURNAL_MAX_RANGE_DAYS = 400;

// Calendar date (YYYY-MM-DD), rejecting impossible dates like 2026-13-45.
export const dateStringSchema = z.iso.date("Date must be a valid YYYY-MM-DD date");

export const habitIdSchema = z.coerce
  .number()
  .int()
  .positive();

export const updateHabitSchema = z.object({
  name: z.string()
    .trim()
    .min(1, "Habit name is required")
    .max(HABIT_NAME_MAX_LENGTH)
    .optional(),
  description: z
    .string()
    .trim()
    .max(HABIT_DESCRIPTION_MAX_LENGTH)
    .nullable()
    .optional(),
    archived: z.boolean().optional(),
}).refine((body) => Object.keys(body).length > 0, {
  message: "Nothing to update",
});

export const habitListQuerySchema = z.object({
  status: z.enum(["active", "archived", "all"]).default("active"),
});


export const createHabitSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Habit name is required")
    .max(HABIT_NAME_MAX_LENGTH),

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

export const habitCompletionsQuerySchema = z
  .object({
    from: dateStringSchema.optional(),
    to: dateStringSchema.optional(),
  })
  .refine((query) => !query.from || !query.to || query.from <= query.to, {
    message: "'from' must not be after 'to'",
  });

export const habitCompletionParamsSchema = z.object({
  id: habitIdSchema,
  date: dateStringSchema,
});

export const journalEntryIdSchema = z.coerce
  .number()
  .int()
  .positive();

const journalContentSchema = z
  .string()
  .trim()
  .min(1, "Content cannot be empty")
  .max(JOURNAL_CONTENT_MAX_LENGTH);

export const createJournalEntrySchema = z.object({
  content: journalContentSchema,
});

export const updateJournalEntrySchema = z.object({
  content: journalContentSchema,
});

// 'from' is inclusive and 'to' is exclusive, so adjacent days never overlap.
export const journalRangeQuerySchema = z
  .object({
    from: z.iso.datetime({
      offset: true,
      error: "'from' is required and must be an ISO 8601 timestamp with offset",
    }),
    to: z.iso.datetime({
      offset: true,
      error: "'to' is required and must be an ISO 8601 timestamp with offset",
    }),
  })
  .refine((query) => new Date(query.from) < new Date(query.to), {
    message: "'from' must be before 'to'",
  })
  .refine(
    (query) =>
      new Date(query.to).getTime() - new Date(query.from).getTime() <=
      JOURNAL_MAX_RANGE_DAYS * 24 * 60 * 60 * 1000,
    { message: `Range cannot exceed ${JOURNAL_MAX_RANGE_DAYS} days` },
  );

// Formats the first Zod issue into a short, user-facing message.
export function formatZodError(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Invalid request";
}