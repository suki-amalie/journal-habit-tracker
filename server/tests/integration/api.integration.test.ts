import { randomUUID } from "node:crypto";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { app } from "../../src/app.js";
import { prisma } from "../../src/lib/prisma.js";
import { SESSION_COOKIE } from "../../src/lib/authCookie.js";
import { hashSessionToken } from "../../src/lib/sessionService.js";

describe("PostgreSQL integration", () => {
  const agent = request.agent(app); // User A
  const otherAgent = request.agent(app); // User B

  let testUserId: number | undefined;
  let otherUserId: number | undefined;

  beforeAll(async () => {
    const email = `integration-${randomUUID()}@example.com`;

    const registerResponse = await agent.post("/api/auth/register").send({
      username: "integration-test",
      email,
      password: "IntegrationTestPassword123!",
    });
    expect(registerResponse.status).toBe(201);

    // Save the ID immediately so cleanup can still work if a later assertion fails.
    testUserId = registerResponse.body.user.id;

    const meResponse = await agent.get("/api/auth/me");

    expect(meResponse.status).toBe(200);
    expect(meResponse.body.user.id).toBe(testUserId);

    // Register a completely separate user with a separate cookie jar.
    const otherEmail = `integration-${randomUUID()}@example.com`;
    const otherRegisterResponse = await otherAgent
      .post("/api/auth/register")
      .send({
        username: "integration-other",
        email: otherEmail,
        password: "IntegrationTestPassword123!",
      });

    expect(otherRegisterResponse.status).toBe(201);

    otherUserId = otherRegisterResponse.body.user.id;

    const otherMeResponse = await otherAgent.get("/api/auth/me");

    expect(otherMeResponse.status).toBe(200);
    expect(otherMeResponse.body.user.id).toBe(otherUserId);
    expect(otherUserId).not.toBe(testUserId);
  });

  afterAll(async () => {
    const userIds = [testUserId, otherUserId].filter(
      (id): id is number => id !== undefined,
    );

    try {
      if (userIds.length > 0) {
        await prisma.habitCompletion.deleteMany({
          where: {
            habit: {
              is: {
                userId: { in: userIds },
              },
            },
          },
        });

        await prisma.habit.deleteMany({
          where: {
            userId: { in: userIds },
          },
        });

        await prisma.journalEntry.deleteMany({
          where: {
            userId: { in: userIds },
          },
        });

        await prisma.session.deleteMany({
          where: {
            userId: { in: userIds },
          },
        });

        await prisma.user.deleteMany({
          where: {
            id: { in: userIds },
          },
        });
      }
    } finally {
      await prisma.$disconnect();
    }
  });

  it("creates a habit in the real database", async () => {
    if (testUserId === undefined) {
      throw new Error("Integration test user was not initialized");
    }

    const response = await agent.post("/api/habits").send({
      name: "Read",
      description: "Read for 30 minutes",
    });

    expect(response.status).toBe(201);

    const habit = await prisma.habit.findFirst({
      where: {
        name: "Read",
        userId: testUserId,
      },
    });

    expect(habit).not.toBeNull();
    expect(habit?.description).toBe("Read for 30 minutes");
  });

  it("rejects duplicate habit completions", async () => {
    const habitResponse = await agent.post("/api/habits").send({
      name: "Exercise",
    });

    expect(habitResponse.status).toBe(201);

    const habitId = habitResponse.body.id;
    const completion = {
      date: "2026-10-06",
    };

    const firstResponse = await agent
      .post(`/api/habits/${habitId}/completions`)
      .send(completion);

    expect(firstResponse.status).toBe(201);

    const duplicateResponse = await agent
      .post(`/api/habits/${habitId}/completions`)
      .send(completion);

    expect(duplicateResponse.status).toBe(409);
  });

  it("deletes a habit and cascades its completions", async () => {
    const habitResponse = await agent.post("/api/habits").send({
      name: "Walk",
    });

    expect(habitResponse.status).toBe(201);

    const habitId = habitResponse.body.id;

    const completionResponse = await agent
      .post(`/api/habits/${habitId}/completions`)
      .send({ date: "2026-10-06" });

    expect(completionResponse.status).toBe(201);

    const beforeDelete = await prisma.habitCompletion.count({
      where: { habitId },
    });

    expect(beforeDelete).toBe(1);

    const deleteResponse = await agent.delete(`/api/habits/${habitId}`);

    expect(deleteResponse.status).toBe(204);

    const deletedHabit = await prisma.habit.findUnique({
      where: { id: habitId },
    });

    const remainingCompletions = await prisma.habitCompletion.count({
      where: { habitId },
    });

    expect(deletedHabit).toBeNull();
    expect(remainingCompletions).toBe(0);
  });

  it("prevents one user from accessing another user's journal entry", async () => {
    if (testUserId === undefined || otherUserId === undefined) {
      throw new Error("Integration test users were not initialized");
    }

    const originalContent = "User A's private journal entry";

    // User A creates a private entry.
    const createResponse = await agent.post("/api/journal").send({
      content: originalContent,
    });

    expect(createResponse.status).toBe(201);

    const entryId: number = createResponse.body.id;

    expect(createResponse.body.userId).toBe(testUserId);

    // Verify that the entry really exists in PostgreSQL.
    const originalEntry = await prisma.journalEntry.findUnique({
      where: { id: entryId },
    });

    expect(originalEntry).not.toBeNull();
    expect(originalEntry?.userId).toBe(testUserId);
    expect(originalEntry?.content).toBe(originalContent);

    // User B attempts to read User A's entry.
    const readResponse = await otherAgent.get(`/api/journal/${entryId}`);

    expect(readResponse.status).toBe(404);

    // User B attempts to modify User A's entry.
    const updateResponse = await otherAgent
      .put(`/api/journal/${entryId}`)
      .send({
        content: "Modified by User B",
      });

    expect(updateResponse.status).toBe(404);

    // User B attempts to delete User A's entry.
    const deleteResponse = await otherAgent.delete(`/api/journal/${entryId}`);

    expect(deleteResponse.status).toBe(404);

    // Check the real database: the original entry must remain unchanged.
    const entryAfterAttacks = await prisma.journalEntry.findUnique({
      where: { id: entryId },
    });

    expect(entryAfterAttacks).not.toBeNull();
    expect(entryAfterAttacks?.userId).toBe(testUserId);
    expect(entryAfterAttacks?.content).toBe(originalContent);

    // User A must still be able to read their own entry.
    const ownerResponse = await agent.get(`/api/journal/${entryId}`);

    expect(ownerResponse.status).toBe(200);
    expect(ownerResponse.body.content).toBe(originalContent);

    // Check that User B cannot see User A's entry in journal history.
    const from = new Date(Date.now() - 60_000).toISOString();
    const to = new Date(Date.now() + 60_000).toISOString();

    const otherListResponse = await otherAgent
      .get("/api/journal")
      .query({ from, to });

    expect(otherListResponse.status).toBe(200);
    expect(otherListResponse.body).toEqual([]);

    // User B must not see User A's journal activity either.
    const otherActivityResponse = await otherAgent
      .get("/api/journal/activity")
      .query({ from, to });

    expect(otherActivityResponse.status).toBe(200);
    expect(otherActivityResponse.body).toEqual([]);

    const otherFirstActivityResponse = await otherAgent.get(
      "/api/journal/activity/first",
    );

    expect(otherFirstActivityResponse.status).toBe(200);
    expect(otherFirstActivityResponse.body).toBeNull();
  });

  it("prevents one user from accessing another user's habits and completions", async () => {
    if (testUserId === undefined || otherUserId === undefined) {
      throw new Error("Integration test users were not initialized");
    }

    const originalName = "User A private habit";
    const completionDate = "2026-10-06";

    // User A creates a habit.
    const createResponse = await agent.post("/api/habits").send({
      name: originalName,
      description: "A private habit",
    });

    expect(createResponse.status).toBe(201);

    const habitId: number = createResponse.body.id;

    // User A records a completion.
    const completionResponse = await agent
      .post(`/api/habits/${habitId}/completions`)
      .send({ date: completionDate });

    expect(completionResponse.status).toBe(201);

    // Confirm the data belongs to User A in the real database.
    const originalHabit = await prisma.habit.findUnique({
      where: { id: habitId },
    });

    expect(originalHabit?.userId).toBe(testUserId);
    expect(originalHabit?.name).toBe(originalName);

    const originalCompletion = await prisma.habitCompletion.findUnique({
      where: {
        habitId_date: {
          habitId,
          date: new Date(`${completionDate}T00:00:00.000Z`),
        },
      },
    });

    expect(originalCompletion).not.toBeNull();

    // User B attempts to modify User A's habit.
    const updateResponse = await otherAgent
      .patch(`/api/habits/${habitId}`)
      .send({ name: "Modified by User B" });

    expect(updateResponse.status).toBe(404);

    // User B attempts to delete User A's habit.
    const deleteResponse = await otherAgent.delete(`/api/habits/${habitId}`);

    expect(deleteResponse.status).toBe(404);

    // User B attempts to add a completion to User A's habit.
    const addCompletionResponse = await otherAgent
      .post(`/api/habits/${habitId}/completions`)
      .send({ date: "2026-10-07" });

    expect(addCompletionResponse.status).toBe(404);

    // User B attempts to read User A's completions.
    const readCompletionsResponse = await otherAgent.get(
      `/api/habits/${habitId}/completions`,
    );

    expect(readCompletionsResponse.status).toBe(404);

    // User B attempts to delete User A's completion.
    const deleteCompletionResponse = await otherAgent.delete(
      `/api/habits/${habitId}/completions/${completionDate}`,
    );

    expect(deleteCompletionResponse.status).toBe(404);

    // User B must not see User A's habit in the habit list.
    const otherHabitsResponse = await otherAgent.get("/api/habits");

    expect(otherHabitsResponse.status).toBe(200);
    expect(
      otherHabitsResponse.body.some(
        (habit: { id: number }) => habit.id === habitId,
      ),
    ).toBe(false);

    // User B must not see User A's completion in the all-completions list.
    const otherAllCompletionsResponse = await otherAgent
      .get("/api/habits/completions")
      .query({
        from: "2026-10-01",
        to: "2026-10-12",
      });

    expect(otherAllCompletionsResponse.status).toBe(200);
    expect(
      otherAllCompletionsResponse.body.some(
        (completion: { habitId: number }) => completion.habitId === habitId,
      ),
    ).toBe(false);

    // Verify the attacks did not alter or delete User A's data.
    const habitAfterAttacks = await prisma.habit.findUnique({
      where: { id: habitId },
    });

    expect(habitAfterAttacks).not.toBeNull();
    expect(habitAfterAttacks?.userId).toBe(testUserId);
    expect(habitAfterAttacks?.name).toBe(originalName);

    const completionAfterAttacks = await prisma.habitCompletion.findUnique({
      where: {
        habitId_date: {
          habitId,
          date: new Date(`${completionDate}T00:00:00.000Z`),
        },
      },
    });

    expect(completionAfterAttacks).not.toBeNull();

    // User A should still be able to read their own habit and completion.
    const ownerHabitsResponse = await agent.get("/api/habits");

    expect(ownerHabitsResponse.status).toBe(200);
    expect(
      ownerHabitsResponse.body.some(
        (habit: { id: number }) => habit.id === habitId,
      ),
    ).toBe(true);

    const ownerCompletionsResponse = await agent.get(
      `/api/habits/${habitId}/completions`,
    );

    expect(ownerCompletionsResponse.status).toBe(200);
    expect(
      ownerCompletionsResponse.body.some((completion: { date: string }) =>
        completion.date.startsWith(completionDate),
      ),
    ).toBe(true);
  });

  it("invalidates the session after logout", async () => {
    if (testUserId === undefined) {
      throw new Error("Integration test user was not initialized");
    }

    // The user starts authenticated.
    const beforeLogout = await agent.get("/api/auth/me");

    expect(beforeLogout.status).toBe(200);

    // Confirm the user's session exists in PostgreSQL.
    const sessionsBeforeLogout = await prisma.session.findMany({
      where: { userId: testUserId },
    });

    expect(sessionsBeforeLogout.length).toBeGreaterThan(0);

    // Log out.
    const logoutResponse = await agent.post("/api/auth/logout");

    expect(logoutResponse.status).toBe(204);

    // The response should instruct the browser to clear the session cookie.
    const setCookieHeader = logoutResponse.headers["set-cookie"];

    expect(setCookieHeader).toBeDefined();
    expect(
      (Array.isArray(setCookieHeader)
        ? setCookieHeader
        : [setCookieHeader]
      ).some(
        (cookie) =>
          /hibi_session=.*Expires=Thu, 01 Jan 1970/i.test(cookie) ||
          /hibi_session=.*Max-Age=0/i.test(cookie),
      ),
    ).toBe(true);

    // The session must no longer exist in PostgreSQL.
    const sessionsAfterLogout = await prisma.session.findMany({
      where: { userId: testUserId },
    });

    expect(sessionsAfterLogout).toHaveLength(0);

    // The same agent should no longer be authenticated.
    const afterLogout = await agent.get("/api/auth/me");

    expect(afterLogout.status).toBe(401);

    // Protected journal data must no longer be accessible.
    const journalResponse = await agent.get("/api/journal");

    expect(journalResponse.status).toBe(401);
  });

  it("rejects and deletes expired sessions on protected endpoints", async () => {
    if (testUserId === undefined) {
      throw new Error("Test user was not created.");
    }

    const protectedEndpoints = ["/api/auth/me", "/api/journal", "/api/habits"];

    for (const endpoint of protectedEndpoints) {
      // Create a unique token and store only its hash in the database.
      const token = randomUUID();
      const tokenHash = hashSessionToken(token);

      await prisma.session.create({
        data: {
          userId: testUserId,
          tokenHash,
          expiresAt: new Date(Date.now() - 60_000),
        },
      });

      // Send the expired session cookie to the endpoint.
      const response = await request(app)
        .get(endpoint)
        .set("Cookie", `${SESSION_COOKIE}=${token}`);

      expect(response.status).toBe(401);

      // The middleware should delete the expired session.
      const remainingSession = await prisma.session.findUnique({
        where: { tokenHash },
      });

      expect(remainingSession).toBeNull();
    }
  });

  it("rejects missing and invalid session cookies", async () => {
    const protectedEndpoints = ["/api/auth/me", "/api/journal", "/api/habits"];

    for (const endpoint of protectedEndpoints) {
      // No session cookie.
      const missingCookieResponse = await request(app).get(endpoint);

      expect(missingCookieResponse.status).toBe(401);
      expect(missingCookieResponse.body).toEqual({
        error: "Authentication required.",
      });

      // A well-formed cookie containing a token that does not exist.
      const invalidCookieResponse = await request(app)
        .get(endpoint)
        .set("Cookie", `${SESSION_COOKIE}=invalid-session-token`);

      expect(invalidCookieResponse.status).toBe(401);
      expect(invalidCookieResponse.body).toEqual({
        error: "Session is invalid or expired.",
      });
    }
  });

  it("rejects reuse of a session token after logout", async () => {
    if (otherUserId === undefined) {
      throw new Error("Other test user was not created.");
    }

    // Create a known, valid session for the second test user.
    const token = randomUUID();
    const tokenHash = hashSessionToken(token);

    await prisma.session.create({
      data: {
        userId: otherUserId,
        tokenHash,
        expiresAt: new Date(Date.now() + 60_000),
      },
    });

    const cookie = `${SESSION_COOKIE}=${token}`;

    // Confirm the session works before logout.
    const beforeLogout = await request(app)
      .get("/api/auth/me")
      .set("Cookie", cookie);

    expect(beforeLogout.status).toBe(200);
    expect(beforeLogout.body.user.id).toBe(otherUserId);

    // Log out using that exact session.
    const logoutResponse = await request(app)
      .post("/api/auth/logout")
      .set("Cookie", cookie);

    expect(logoutResponse.status).toBe(204);

    // Confirm the session was revoked in PostgreSQL.
    const revokedSession = await prisma.session.findUnique({
      where: { tokenHash },
    });

    expect(revokedSession).toBeNull();

    // Attempt to reuse the original token, ignoring the cleared cookie.
    for (const endpoint of ["/api/auth/me", "/api/journal", "/api/habits"]) {
      const response = await request(app).get(endpoint).set("Cookie", cookie);

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        error: "Session is invalid or expired.",
      });
    }
  });
});
