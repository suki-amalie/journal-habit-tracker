import { Prisma } from "@prisma/client";

function hasCode(error: unknown, code: string): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === code
  );
}

// The record targeted by an update or delete doesn't exist.
export function isRecordNotFound(error: unknown): boolean {
  return hasCode(error, "P2025");
}

// A unique constraint was violated.
export function isUniqueViolation(error: unknown): boolean {
  return hasCode(error, "P2002");
}
