
import type { RequestHandler } from "express";

import { prisma } from "../lib/prisma.js";
import {
  SESSION_COOKIE,
  clearSessionCookie,
} from "../lib/authCookie.js";
import { hashSessionToken } from "../lib/sessionService.js";

export const requireAuth: RequestHandler = async (
  req,
  res,
  next,
) => {
  const token = req.cookies?.[SESSION_COOKIE];

  // No session cookie means the user is not authenticated.
  if (typeof token !== "string" || token.length === 0) {
    res.status(401).json({
      error: "Authentication required.",
    });
    return;
  }

  const tokenHash = hashSessionToken(token);

  const session = await prisma.session.findUnique({
    where: {
      tokenHash,
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          email: true,
        },
      },
    },
  });

  // The token may be invalid, revoked, or belong to an expired session.
  if (!session || session.expiresAt <= new Date()) {
    if (session) {
      await prisma.session.delete({
        where: {
          id: session.id,
        },
      });
    }

    clearSessionCookie(res);

    res.status(401).json({
      error: "Session is invalid or expired.",
    });
    return;
  }

  // Authentication succeeded. Make the user available to later handlers.
  console.log("Session found:", session);
  req.user = session.user;
  console.log("Authenticated user:", req.user);


  next();
};
