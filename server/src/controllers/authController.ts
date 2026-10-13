import type { Request, Response } from "express";
import argon2 from "argon2";
import { z } from "zod";

import { prisma } from "../lib/prisma.js";
import {
  SESSION_COOKIE,
  clearSessionCookie,
  setSessionCookie,
} from "../lib/authCookie.js";
import {
  createSession,
  deleteSession,
} from "../lib/sessionService.js";

const registerSchema = z.object({
  username: z.string().trim().min(1).max(30),
  email: z.string().trim().email().max(255),
  password: z.string().min(9).max(128),
});

const loginSchema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(1).max(128),
});

export function getMe(req: Request, res: Response) {
  res.json({
    user: req.user,
  });
}

export async function login(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      error: "Please provide a valid email and password.",
    });
    return;
  }

  const email = parsed.data.email.toLowerCase();
  const { password } = parsed.data;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        username: true,
        email: true,
        passwordHash: true,
        createdAt: true,
      },
    });

    if (!user || !(await argon2.verify(user.passwordHash, password))) {
      res.status(401).json({
        error: "Invalid email or password.",
      });
      return;
    }

    const session = await createSession(user.id);
    setSessionCookie(res, session.token);

    res.status(200).json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Login failed:", error);

    res.status(500).json({
      error: "Unable to log in.",
    });
  }
}

export async function register(req: Request, res: Response) {
  const parsed = registerSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      error:
        "Please provide a valid username, email and a password of 9-128 characters.",
    });
    return;
  }

  const { email, password, username } = parsed.data;
  const normalizedEmail = email.toLowerCase();

  try {
    const passwordHash = await argon2.hash(password, {
      type: argon2.argon2id,
    });

    const user = await prisma.user.create({
      data: {
        username,
        email: normalizedEmail,
        passwordHash,
      },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
      },
    });

    const session = await createSession(user.id);
    setSessionCookie(res, session.token);

    res.status(201).json({ user });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      res.status(409).json({
        error: "An account with this email already exists.",
      });
      return;
    }

    console.error("Registration failed:", error);

    res.status(500).json({
      error: "Unable to create your account.",
    });
  }
}

export async function logout(req: Request, res: Response) {
  const token = req.cookies?.[SESSION_COOKIE];

  try {
    if (typeof token === "string") {
      await deleteSession(token);
    }

    clearSessionCookie(res);
    res.status(204).end();
  } catch (error) {
    console.error("Logout failed:", error);

    res.status(500).json({
      error: "Unable to log out.",
    });
  }
}