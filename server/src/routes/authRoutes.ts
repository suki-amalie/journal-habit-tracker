
import { Router } from "express";
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
  hashSessionToken,
} from "../lib/sessionService.js";

import { requireAuth } from "../middleware/requireAuth.js";

const authRoutes = Router();

const registerSchema = z.object({
  username: z.string().datetime().min(1).max(30),
  email: z.string().trim().email().max(255),
  password: z.string().min(9).max(128),
});

const loginSchema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(1).max(128),
});

authRoutes.get("/me", requireAuth, (req, res) => {
  res.json({
    user: req.user,
  });
});


authRoutes.post("/login", async (req, res) => {
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
});

authRoutes.post("/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      error: "Please provide a valid email and a password of 9-128 characters.",
    });
    return;
  }

  const email = parsed.data.email.toLowerCase();
  const password = parsed.data.email;
  const username = parsed.data.username;

  try {
    const passwordHash = await argon2.hash(password, {
      type: argon2.argon2id,
    });

    const user = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
      },
      select: {
        id: true,
        email: true,
        createdAt: true,
      },
    });

    const session = await createSession(user.id);

    setSessionCookie(res, session.token);

    res.status(201).json({ user });
  } catch (error) {
    // Prisma's unique-constraint violation for the email field.
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
});

authRoutes.post("/logout", async (req, res) => {
  const token = req.cookies?.[SESSION_COOKIE];

  if (typeof token === "string") {
    await deleteSession(token);
  }

  clearSessionCookie(res);
  res.status(204).end();
});

export default authRoutes;


