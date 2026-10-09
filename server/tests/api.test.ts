import { Prisma } from "@prisma/client";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = vi.hoisted(() => ({
  habit: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  habitCompletion: {
    findMany: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
  },
  journalEntry: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("../src/lib/prisma.js", () => ({ prisma: prismaMock }));

const { app } = await import("../src/app.js");

function prismaError(code: string) {
  return new Prisma.PrismaClientKnownRequestError("test", {
    code,
    clientVersion: "test",
  });
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("GET /api/health", () => {
  it("responds ok", async () => {
    const res = await request(app).get("/api/health");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });
});

describe("habits", () => {
  it("lists only active habits by default", async () => {
    prismaMock.habit.findMany.mockResolvedValue([]);

    const res = await request(app).get("/api/habits");

    expect(res.status).toBe(200);
    expect(prismaMock.habit.findMany.mock.calls[0]?.[0]?.where).toEqual({
      archivedAt: null,
    });
  });

  it("rejects an unknown status filter", async () => {
    const res = await request(app).get("/api/habits?status=bogus");

    expect(res.status).toBe(400);
  });

  it("creates a habit", async () => {
    prismaMock.habit.create.mockResolvedValue({ id: 1, name: "Read" });

    const res = await request(app)
      .post("/api/habits")
      .send({ name: "Read", description: null });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe("Read");
  });

  it("rejects a habit without a name", async () => {
    const res = await request(app).post("/api/habits").send({ name: "  " });

    expect(res.status).toBe(400);
    expect(prismaMock.habit.create).not.toHaveBeenCalled();
  });

  it("rejects an empty update", async () => {
    const res = await request(app).patch("/api/habits/1").send({});

    expect(res.status).toBe(400);
  });

  it("returns 404 when updating a missing habit", async () => {
    prismaMock.habit.update.mockRejectedValue(prismaError("P2025"));

    const res = await request(app).patch("/api/habits/9").send({ name: "x" });

    expect(res.status).toBe(404);
  });

  it("archives a habit by setting archivedAt", async () => {
    prismaMock.habit.update.mockResolvedValue({ id: 1 });

    const res = await request(app)
      .patch("/api/habits/1")
      .send({ archived: true });

    expect(res.status).toBe(200);
    expect(
      prismaMock.habit.update.mock.calls[0]?.[0]?.data.archivedAt,
    ).toBeInstanceOf(Date);
  });

  it("deletes a habit with 204 and 404 when missing", async () => {
    prismaMock.habit.delete.mockResolvedValueOnce({});
    expect((await request(app).delete("/api/habits/1")).status).toBe(204);

    prismaMock.habit.delete.mockRejectedValueOnce(prismaError("P2025"));
    expect((await request(app).delete("/api/habits/1")).status).toBe(404);
  });

  it("rejects a non-numeric habit id", async () => {
    const res = await request(app).delete("/api/habits/abc");

    expect(res.status).toBe(400);
  });
});

describe("habit completions", () => {
  const url = "/api/habits/1/completions";

  it("creates a completion", async () => {
    prismaMock.habit.findUnique.mockResolvedValue({ id: 1, archivedAt: null });
    prismaMock.habitCompletion.create.mockResolvedValue({ id: 5 });

    const res = await request(app).post(url).send({ date: "2020-01-01" });

    expect(res.status).toBe(201);
  });

  it("rejects an invalid date", async () => {
    const res = await request(app).post(url).send({ date: "2026-13-45" });

    expect(res.status).toBe(400);
  });

  it("rejects dates far in the future", async () => {
    const res = await request(app).post(url).send({ date: "2999-01-01" });

    expect(res.status).toBe(400);
  });

  it("returns 404 for a missing habit", async () => {
    prismaMock.habit.findUnique.mockResolvedValue(null);

    const res = await request(app).post(url).send({ date: "2020-01-01" });

    expect(res.status).toBe(404);
  });

  it("returns 409 for an archived habit", async () => {
    prismaMock.habit.findUnique.mockResolvedValue({
      id: 1,
      archivedAt: new Date(),
    });

    const res = await request(app).post(url).send({ date: "2020-01-01" });

    expect(res.status).toBe(409);
  });

  it("returns 409 for a duplicate completion", async () => {
    prismaMock.habit.findUnique.mockResolvedValue({ id: 1, archivedAt: null });
    prismaMock.habitCompletion.create.mockRejectedValue(prismaError("P2002"));

    const res = await request(app).post(url).send({ date: "2020-01-01" });

    expect(res.status).toBe(409);
  });

  it("deletes a completion and 404s when it doesn't exist", async () => {
    prismaMock.habitCompletion.delete.mockResolvedValueOnce({});
    expect((await request(app).delete(`${url}/2020-01-01`)).status).toBe(204);

    prismaMock.habitCompletion.delete.mockRejectedValueOnce(prismaError("P2025"));
    expect((await request(app).delete(`${url}/2020-01-01`)).status).toBe(404);
  });

  it("rejects a range where from is after to", async () => {
    const res = await request(app).get(
      "/api/habits/completions?from=2026-02-01&to=2026-01-01",
    );

    expect(res.status).toBe(400);
  });

  it("rejects a range longer than 400 days", async () => {
    const res = await request(app).get(
      "/api/habits/completions?from=2024-01-01&to=2026-01-01",
    );

    expect(res.status).toBe(400);
  });

  it("defaults to a bounded window when no range is given", async () => {
    prismaMock.habitCompletion.findMany.mockResolvedValue([]);

    const res = await request(app).get("/api/habits/completions");
    const { gte, lte } =
      prismaMock.habitCompletion.findMany.mock.calls.at(-1)?.[0]?.where.date;

    expect(res.status).toBe(200);
    expect((lte - gte) / 86_400_000).toBe(366);
  });
});

describe("journal", () => {
  const from = "2026-10-05T00:00:00.000Z";
  const to = "2026-10-06T00:00:00.000Z";

  it("lists entries created in [from, to)", async () => {
    prismaMock.journalEntry.findMany.mockResolvedValue([]);

    const res = await request(app).get("/api/journal").query({ from, to });

    expect(res.status).toBe(200);
    expect(prismaMock.journalEntry.findMany.mock.calls[0]?.[0]?.where).toEqual({
      createdAt: { gte: new Date(from), lt: new Date(to) },
    });
  });

  it("requires a range", async () => {
    expect((await request(app).get("/api/journal")).status).toBe(400);
  });

  it("accepts offsets in the range", async () => {
    prismaMock.journalEntry.findMany.mockResolvedValue([]);

    const res = await request(app)
      .get("/api/journal")
      .query({ from: "2026-10-05T00:00:00+07:00", to: "2026-10-06T00:00:00+07:00" });

    expect(res.status).toBe(200);
  });

  it("rejects ranges that are inverted or too long", async () => {
    const inverted = await request(app)
      .get("/api/journal")
      .query({ from: to, to: from });
    const tooLong = await request(app)
      .get("/api/journal")
      .query({ from: "2024-01-01T00:00:00Z", to: "2026-01-01T00:00:00Z" });

    expect(inverted.status).toBe(400);
    expect(tooLong.status).toBe(400);
  });

  it("returns activity as ISO timestamps", async () => {
    const createdAt = new Date("2026-10-05T10:00:00.000Z");
    prismaMock.journalEntry.findMany.mockResolvedValue([{ createdAt }]);

    const res = await request(app)
      .get("/api/journal/activity")
      .query({ from, to });

    expect(res.body).toEqual([createdAt.toISOString()]);
  });

  it("returns the first journal activity timestamp or null", async () => {
    const createdAt = new Date("2024-03-12T10:00:00.000Z");
    prismaMock.journalEntry.findFirst
      .mockResolvedValueOnce({ createdAt })
      .mockResolvedValueOnce(null);

    const firstActivity = await request(app).get("/api/journal/activity/first");
    const noActivity = await request(app).get("/api/journal/activity/first");

    expect(firstActivity.body).toBe(createdAt.toISOString());
    expect(noActivity.body).toBeNull();
    expect(prismaMock.journalEntry.findFirst).toHaveBeenCalledWith({
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    });
  });

  it("creates, updates and deletes entries", async () => {
    prismaMock.journalEntry.create.mockResolvedValue({ id: 1, content: "hi" });
    expect(
      (await request(app).post("/api/journal").send({ content: "hi" })).status,
    ).toBe(201);

    prismaMock.journalEntry.update.mockResolvedValue({ id: 1, content: "yo" });
    expect(
      (await request(app).put("/api/journal/1").send({ content: "yo" })).status,
    ).toBe(200);

    prismaMock.journalEntry.delete.mockResolvedValue({});
    expect((await request(app).delete("/api/journal/1")).status).toBe(204);
  });

  it("rejects empty content", async () => {
    const res = await request(app).post("/api/journal").send({ content: "   " });

    expect(res.status).toBe(400);
  });

  it("returns 404 when the entry is missing", async () => {
    prismaMock.journalEntry.update.mockRejectedValue(prismaError("P2025"));
    prismaMock.journalEntry.delete.mockRejectedValue(prismaError("P2025"));
    prismaMock.journalEntry.findUnique.mockResolvedValue(null);

    expect(
      (await request(app).put("/api/journal/9").send({ content: "x" })).status,
    ).toBe(404);
    expect((await request(app).delete("/api/journal/9")).status).toBe(404);
    expect((await request(app).get("/api/journal/9")).status).toBe(404);
  });

  it("routes /activity before /:id", async () => {
    prismaMock.journalEntry.findMany.mockResolvedValue([]);

    const res = await request(app)
      .get("/api/journal/activity")
      .query({ from, to });

    expect(res.status).toBe(200);
    expect(prismaMock.journalEntry.findUnique).not.toHaveBeenCalled();
  });
});
