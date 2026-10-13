import { Prisma } from "@prisma/client";
import supertest from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = vi.hoisted(() => ({
  session: {
    findUnique: vi.fn(),
    delete: vi.fn(),
  },
  habit: {
    findFirst: vi.fn(),
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
const TEST_COOKIE = "hibi_session=test-session-token";

const api = {
  get: (url: string) => supertest(app).get(url).set("Cookie", TEST_COOKIE),

  post: (url: string) => supertest(app).post(url).set("Cookie", TEST_COOKIE),

  patch: (url: string) => supertest(app).patch(url).set("Cookie", TEST_COOKIE),

  put: (url: string) => supertest(app).put(url).set("Cookie", TEST_COOKIE),

  delete: (url: string) =>
    supertest(app).delete(url).set("Cookie", TEST_COOKIE),
};

const TEST_USER = {
  id: 1,
  email: "test@example.com",
};

function prismaError(code: string) {
  return new Prisma.PrismaClientKnownRequestError("test", {
    code,
    clientVersion: "test",
  });
}

beforeEach(() => {
  vi.resetAllMocks();
  //vi.spyOn(console, "error").mockImplementation(() => {});
  prismaMock.session.findUnique.mockResolvedValue({
    id: 1,
    userId: TEST_USER.id,
    tokenHash: "mock-hash",
    expiresAt: new Date(Date.now() + 60_000),
    user: TEST_USER,
  });
});

describe("GET /api/health", () => {
  it("responds ok", async () => {
    const res = await supertest(app).get("/api/health");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });
});

describe("habits", () => {
  it("lists only active habits by default", async () => {
    prismaMock.habit.findMany.mockResolvedValue([]);

    const res = await api.get("/api/habits");
    //console.log("Response:", res.status, res.body);
    //console.log("Response:", res.status, JSON.stringify(res.body, null, 2));
    // //console.log(
    //   "findMany calls:",
    //   JSON.stringify(prismaMock.habit.findMany.mock.calls, null, 2),
    // );
    expect(res.status, JSON.stringify(res.body)).toBe(200);
    expect(prismaMock.habit.findMany.mock.calls[0]?.[0]?.where).toEqual({
      userId: TEST_USER.id,
      archivedAt: null,
    });
  });

  it("rejects an unknown status filter", async () => {
    const res = await api.get("/api/habits?status=bogus");

    expect(res.status).toBe(400);
  });

  it("creates a habit", async () => {
    prismaMock.habit.create.mockResolvedValue({ id: 1, name: "Read" });

    const res = await api
      .post("/api/habits")
      .send({ name: "Read", description: null });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe("Read");
  });

  it("rejects a habit without a name", async () => {
    const res = await api.post("/api/habits").send({ name: "  " });

    expect(res.status).toBe(400);
    expect(prismaMock.habit.create).not.toHaveBeenCalled();
  });

  it("rejects an empty update", async () => {
    const res = await api.patch("/api/habits/1").send({});

    expect(res.status).toBe(400);
  });

  it("returns 404 when updating a missing habit", async () => {
    prismaMock.habit.update.mockRejectedValue(prismaError("P2025"));

    const res = await api.patch("/api/habits/9").send({ name: "x" });

    expect(res.status).toBe(404);
  });

  it("archives a habit by setting archivedAt", async () => {
    prismaMock.habit.update.mockResolvedValue({ id: 1 });

    const res = await api.patch("/api/habits/1").send({ archived: true });

    expect(res.status).toBe(200);
    expect(
      prismaMock.habit.update.mock.calls[0]?.[0]?.data.archivedAt,
    ).toBeInstanceOf(Date);
  });

  it("deletes a habit with 204 and 404 when missing", async () => {
    prismaMock.habit.delete.mockResolvedValueOnce({});
    expect((await api.delete("/api/habits/1")).status).toBe(204);

    prismaMock.habit.delete.mockRejectedValueOnce(prismaError("P2025"));
    expect((await api.delete("/api/habits/1")).status).toBe(404);
  });

  it("rejects a non-numeric habit id", async () => {
    const res = await api.delete("/api/habits/abc");

    expect(res.status).toBe(400);
  });
});

describe("habit completions", () => {
  const url = "/api/habits/1/completions";

  it("creates a completion", async () => {
    prismaMock.habit.findUnique.mockResolvedValue({ id: 1, archivedAt: null });
    prismaMock.habitCompletion.create.mockResolvedValue({ id: 5 });

    const res = await api.post(url).send({ date: "2020-01-01" });

    expect(res.status).toBe(201);
  });

  it("rejects an invalid date", async () => {
    const res = await api.post(url).send({ date: "2026-13-45" });

    expect(res.status).toBe(400);
  });

  it("rejects dates far in the future", async () => {
    const res = await api.post(url).send({ date: "2999-01-01" });

    expect(res.status).toBe(400);
  });

  it("returns 404 for a missing habit", async () => {
    prismaMock.habit.findUnique.mockResolvedValue(null);

    const res = await api.post(url).send({ date: "2020-01-01" });

    expect(res.status).toBe(404);
  });

  it("returns 409 for an archived habit", async () => {
    prismaMock.habit.findUnique.mockResolvedValue({
      id: 1,
      archivedAt: new Date(),
    });

    const res = await api.post(url).send({ date: "2020-01-01" });

    expect(res.status).toBe(409);
  });

  it("returns 409 for a duplicate completion", async () => {
    prismaMock.habit.findUnique.mockResolvedValue({ id: 1, archivedAt: null });
    prismaMock.habitCompletion.create.mockRejectedValue(prismaError("P2002"));

    const res = await api.post(url).send({ date: "2020-01-01" });

    expect(res.status).toBe(409);
  });

  it("deletes a completion and 404s when it doesn't exist", async () => {
    // The habit belongs to the authenticated user.
    prismaMock.habit.findFirst.mockResolvedValue({
      id: 1,
    } as never);
    // First request: completion exists and is deleted successfully.
    prismaMock.habitCompletion.delete.mockResolvedValue({} as never);

    expect((await api.delete(`${url}/2020-01-01`)).status).toBe(204);

    // Second request: the habit exists, but its completion does not.
    prismaMock.habitCompletion.delete.mockRejectedValue(prismaError("P2025"));

    expect((await api.delete(`${url}/2020-01-02`)).status).toBe(404);
  });

  it("rejects a range where from is after to", async () => {
    const res = await api.get(
      "/api/habits/completions?from=2026-02-01&to=2026-01-01",
    );

    expect(res.status).toBe(400);
  });

  it("rejects a range longer than 400 days", async () => {
    const res = await api.get(
      "/api/habits/completions?from=2024-01-01&to=2026-01-01",
    );

    expect(res.status).toBe(400);
  });

  it("defaults to a bounded window when no range is given", async () => {
    prismaMock.habitCompletion.findMany.mockResolvedValue([]);

    const res = await api.get("/api/habits/completions");
    const { gte, lte } =
      prismaMock.habitCompletion.findMany.mock.calls.at(-1)?.[0]?.where.date;

    expect(res.status).toBe(200);
    expect((lte - gte) / 86_400_000).toBe(366);
  });

  it("rejects unauthenticated requests", async () => {
    const res = await supertest(app).get("/api/habits");

    expect(res.status).toBe(401);
    expect(prismaMock.habit.findMany).not.toHaveBeenCalled();
  });
});

describe("journal", () => {
  const from = "2026-10-05T00:00:00.000Z";
  const to = "2026-10-06T00:00:00.000Z";

  it("lists entries created in [from, to)", async () => {
    prismaMock.journalEntry.findMany.mockResolvedValue([]);

    const res = await api.get("/api/journal").query({ from, to });

    expect(res.status).toBe(200);
    expect(prismaMock.journalEntry.findMany.mock.calls[0]?.[0]?.where).toEqual({
      userId: 1,
      createdAt: { gte: new Date(from), lt: new Date(to) },
    });
  });

  it("requires a range", async () => {
    expect((await api.get("/api/journal")).status).toBe(400);
  });

  it("accepts offsets in the range", async () => {
    prismaMock.journalEntry.findMany.mockResolvedValue([]);

    const res = await api.get("/api/journal").query({
      from: "2026-10-05T00:00:00+07:00",
      to: "2026-10-06T00:00:00+07:00",
    });

    expect(res.status).toBe(200);
  });

  it("rejects ranges that are inverted or too long", async () => {
    const inverted = await api
      .get("/api/journal")
      .query({ from: to, to: from });
    const tooLong = await api
      .get("/api/journal")
      .query({ from: "2024-01-01T00:00:00Z", to: "2026-01-01T00:00:00Z" });

    expect(inverted.status).toBe(400);
    expect(tooLong.status).toBe(400);
  });

  it("returns activity as ISO timestamps", async () => {
    const createdAt = new Date("2026-10-05T10:00:00.000Z");
    prismaMock.journalEntry.findMany.mockResolvedValue([{ createdAt }]);

    const res = await api.get("/api/journal/activity").query({ from, to });

    expect(res.body).toEqual([createdAt.toISOString()]);
    expect(prismaMock.journalEntry.findMany).toHaveBeenCalledWith({
      where: {
        userId: 1,
        createdAt: {
          gte: new Date(from),
          lt: new Date(to),
        },
      },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    });
  });

  it("returns the first journal activity timestamp or null", async () => {
    const createdAt = new Date("2024-03-12T10:00:00.000Z");
    prismaMock.journalEntry.findFirst
      .mockResolvedValueOnce({ createdAt })
      .mockResolvedValueOnce(null);

    const firstActivity = await api.get("/api/journal/activity/first");
    const noActivity = await api.get("/api/journal/activity/first");

    expect(firstActivity.body).toBe(createdAt.toISOString());
    expect(noActivity.body).toBeNull();
    expect(prismaMock.journalEntry.findFirst).toHaveBeenCalledWith({
      where: {
        userId: 1,
      },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    });
  });

  it("creates, updates and deletes entries", async () => {
    prismaMock.journalEntry.create.mockResolvedValue({ id: 1, content: "hi" });
    expect(
      (await api.post("/api/journal").send({ content: "hi" })).status,
    ).toBe(201);

    prismaMock.journalEntry.update.mockResolvedValue({ id: 1, content: "yo" });
    expect(
      (await api.put("/api/journal/1").send({ content: "yo" })).status,
    ).toBe(200);

    prismaMock.journalEntry.delete.mockResolvedValue({});
    expect((await api.delete("/api/journal/1")).status).toBe(204);
  });

  it("rejects empty content", async () => {
    const res = await api.post("/api/journal").send({ content: "   " });

    expect(res.status).toBe(400);
  });

  it("returns 404 when the entry is missing", async () => {
    prismaMock.journalEntry.update.mockRejectedValue(prismaError("P2025"));
    prismaMock.journalEntry.delete.mockRejectedValue(prismaError("P2025"));
    prismaMock.journalEntry.findUnique.mockResolvedValue(null);

    expect(
      (await api.put("/api/journal/9").send({ content: "x" })).status,
    ).toBe(404);
    expect((await api.delete("/api/journal/9")).status).toBe(404);
    expect((await api.get("/api/journal/9")).status).toBe(404);
  });

  it("routes /activity before /:id", async () => {
    prismaMock.journalEntry.findMany.mockResolvedValue([]);

    const res = await api.get("/api/journal/activity").query({ from, to });

    expect(res.status).toBe(200);
    expect(prismaMock.journalEntry.findUnique).not.toHaveBeenCalled();
  });

  it("cannot read another user's journal entry", async () => {
    // User A requests an entry that does not belong to them.
    // The user-scoped query must not find User B's entry.
    prismaMock.journalEntry.findFirst.mockResolvedValue(null);

    const res = await api.get("/api/journal/42");

    expect(res.status).toBe(404);
    expect(prismaMock.journalEntry.findFirst).toHaveBeenCalledWith({
      where: {
        id: 42,
        userId: 1,
      },
    });
  });

  it("cannot update another user's journal entry", async () => {
    // Prisma returns P2025 when no entry matches both the ID and owner.
    prismaMock.journalEntry.update.mockRejectedValue(prismaError("P2025"));

    const res = await api.put("/api/journal/42").send({
      content: "Trying to change someone else's entry",
    });

    expect(res.status).toBe(404);
    expect(prismaMock.journalEntry.update).toHaveBeenCalledWith({
      where: {
        id: 42,
        userId: 1,
      },
      data: {
        content: "Trying to change someone else's entry",
      },
    });
  });
  it("cannot delete another user's journal entry", async () => {
    prismaMock.journalEntry.delete.mockRejectedValue(prismaError("P2025"));

    const res = await api.delete("/api/journal/42");

    expect(res.status).toBe(404);
    expect(prismaMock.journalEntry.delete).toHaveBeenCalledWith({
      where: {
        id: 42,
        userId: 1,
      },
    });
  });
});
