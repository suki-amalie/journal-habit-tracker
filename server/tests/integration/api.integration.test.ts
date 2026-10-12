import { randomUUID } from "node:crypto";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { app } from "../../src/app.js";
import { prisma } from "../../src/lib/prisma.js";

describe("PostgreSQL integration", () => {
  const agent = request.agent(app);
  let testUserId: number | undefined;

  beforeAll(async () => {
    const email = `integration-${randomUUID()}@example.com`;

    const registerResponse = await agent.post("/api/auth/register").send({
      username: "integration-test",
      email,
      password: "IntegrationTestPassword123!",
    });

    console.log("Registration status:", registerResponse.status);
    console.log("Registration response:", registerResponse.body);
    expect(registerResponse.status).toBe(201);

    const meResponse = await agent.get("/api/auth/me");

    expect(meResponse.status).toBe(200);
    expect(meResponse.body.user).toHaveProperty("id");

    testUserId = meResponse.body.user.id;
  });

  afterAll(async () => {
    if (testUserId !== undefined) {
      await prisma.habitCompletion.deleteMany({
        where: {
          habit: {
            is: { userId: testUserId },
          },
        },
      });

      await prisma.habit.deleteMany({
        where: { userId: testUserId },
      });

      await prisma.journalEntry.deleteMany({
        where: { userId: testUserId },
      });

      await prisma.session.deleteMany({
        where: { userId: testUserId },
      });

      await prisma.user.delete({
        where: { id: testUserId },
      });
    }

    await prisma.$disconnect();
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
});
