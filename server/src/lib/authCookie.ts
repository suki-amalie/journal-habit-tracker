
import type { CookieOptions, Response } from "express";

export const SESSION_COOKIE = "hibi_session";

const SESSION_DURATION_DAYS = 7;

export const SESSION_DURATION_MS =
  SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000;

function getCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_MS,
  };
}

export function setSessionCookie(
  res: Response,
  token: string,
): void {
  res.cookie(SESSION_COOKIE, token, getCookieOptions());
}

export function clearSessionCookie(res: Response): void {
  const { maxAge: _maxAge, ...options } = getCookieOptions();

  res.clearCookie(SESSION_COOKIE, options);
}
