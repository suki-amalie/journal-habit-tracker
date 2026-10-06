import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";

import { app } from "../../src/app.js";
import { prisma } from "../../src/lib/prisma.js";

beforeEach(async () => {
  await prisma.habitCompletion.deleteMany();
  await prisma.habit.deleteMany();
  await prisma.journalEntry.deleteMany();
});

describe("PostgreSQL integration", () => {
  it("creates a habit in the real database", async () => {
    const response = await request(app).post("/api/habits").send({
      name: "Read",
      description: "Read for 30 minutes",
    });

    expect(response.status).toBe(201);

    const habit = await prisma.habit.findFirst({
      where: {
        name: "Read",
      },
    });

    expect(habit).not.toBeNull();
    expect(habit?.description).toBe("Read for 30 minutes");
  });

  it("rejects a duplicate completion for the same habit and date", async () => {
    const habitResponse = await request(app).post("/api/habits").send({
      name: "Read",
    });

    expect(habitResponse.status).toBe(201);

    const habitId = habitResponse.body.id;

    const firstCompletion = await request(app)
      .post(`/api/habits/${habitId}/completions`)
      .send({
        date: "2026-10-06",
      });

    expect(firstCompletion.status).toBe(201);

    const duplicateCompletion = await request(app)
      .post(`/api/habits/${habitId}/completions`)
      .send({
        date: "2026-10-06",
      });

    expect(duplicateCompletion.status).toBe(409);
  });

  it("deletes a habit and cascades to its completions", async () => {
    const habitResponse = await request(app).post("/api/habits").send({
      name: "Exercise",
    });

    expect(habitResponse.status).toBe(201);

    const habitId = habitResponse.body.id;

    const completionResponse = await request(app)
      .post(`/api/habits/${habitId}/completions`)
      .send({
        date: "2026-10-06",
      });

    expect(completionResponse.status).toBe(201);

    const beforeDelete = await prisma.habitCompletion.count({
      where: {
        habitId,
      },
    });

    expect(beforeDelete).toBe(1);

    const deleteResponse = await request(app).delete(`/api/habits/${habitId}`);

    expect(deleteResponse.status).toBe(204);

    const habit = await prisma.habit.findUnique({
      where: {
        id: habitId,
      },
    });

    const completions = await prisma.habitCompletion.count({
      where: {
        habitId,
      },
    });

    expect(habit).toBeNull();
    expect(completions).toBe(0);
  });
});
