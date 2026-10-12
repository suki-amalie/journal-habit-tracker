
import { createHash, randomBytes } from "node:crypto";

import { prisma } from "./prisma.js";

const SESSION_DURATION_DAYS = 7;

export function hashSessionToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: number) {
  // Generate a token that is practically impossible to guess.
  const token = randomBytes(32).toString("hex");

  const expiresAt = new Date(
    Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000,
  );

  await prisma.session.create({
    data: {
      userId,
      tokenHash: hashSessionToken(token),
      expiresAt,
    },
  });

  // Return the raw token only to the caller.
  return { token, expiresAt };
}

export async function deleteSession(token: string): Promise<void> {
  await prisma.session.deleteMany({
    where: {
      tokenHash: hashSessionToken(token),
    },
  });
}
