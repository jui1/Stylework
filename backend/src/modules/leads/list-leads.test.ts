import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, describe, it } from "node:test";
import { Prisma } from "@prisma/client";
import request from "supertest";
import { createApp } from "../../app.js";
import { HttpError } from "../../errors/http-error.js";
import { prisma } from "../../lib/prisma.js";
import { listLeads } from "./lead.service.js";

const app = createApp();

describe("GET /leads", () => {
  const createdIds: string[] = [];

  after(async () => {
    if (createdIds.length > 0) {
      await prisma.lead.deleteMany({
        where: { externalLeadId: { in: createdIds } },
      });
    }

    await prisma.$disconnect();
  });

  it("returns the newest leads first with page, limit, and total", async () => {
    const totalBefore = await prisma.lead.count();
    const suffix = randomUUID();
    const oldestId = `test-list-${suffix}-oldest`;
    const middleId = `test-list-${suffix}-middle`;
    const newestId = `test-list-${suffix}-newest`;
    createdIds.push(oldestId, middleId, newestId);

    const base = new Date("2030-01-01T00:00:00.000Z");
    await prisma.lead.createMany({
      data: [
        {
          externalLeadId: oldestId,
          name: "Oldest",
          source: "meta",
          createdAt: base,
        },
        {
          externalLeadId: middleId,
          name: "Middle",
          source: "meta",
          createdAt: new Date(base.getTime() + 1_000),
        },
        {
          externalLeadId: newestId,
          name: "Newest",
          source: "meta",
          createdAt: new Date(base.getTime() + 2_000),
        },
      ],
    });

    const firstPage = await request(app).get("/leads").query({ page: 1, limit: 2 });
    const secondPage = await request(app).get("/leads").query({ page: 2, limit: 2 });

    assert.equal(firstPage.status, 200);
    assert.equal(firstPage.body.page, 1);
    assert.equal(firstPage.body.limit, 2);
    assert.ok(firstPage.body.total >= totalBefore + 3);
    assert.deepEqual(
      firstPage.body.data.map((lead: { externalLeadId: string }) => lead.externalLeadId),
      [newestId, middleId],
    );

    assert.equal(secondPage.status, 200);
    assert.equal(secondPage.body.page, 2);
    assert.equal(secondPage.body.limit, 2);
    assert.equal(secondPage.body.total, firstPage.body.total);
    assert.equal(secondPage.body.data[0]?.externalLeadId, oldestId);
  });

  it("uses page 1 and limit 20 when query parameters are omitted", async () => {
    const response = await request(app).get("/leads");

    assert.equal(response.status, 200);
    assert.equal(response.body.page, 1);
    assert.equal(response.body.limit, 20);
    assert.equal(typeof response.body.total, "number");
    assert.ok(Array.isArray(response.body.data));
  });

  it("rejects invalid page and limit values", async () => {
    const cases = [
      { page: 0, limit: 10 },
      { page: -1, limit: 10 },
      { page: "abc", limit: 10 },
      { page: 1, limit: 0 },
      { page: 1, limit: 101 },
      { page: 1.5, limit: 10 },
    ];

    for (const query of cases) {
      const response = await request(app).get("/leads").query(query);
      assert.equal(response.status, 400, JSON.stringify(query));
      assert.equal(response.body.error, "Invalid payload");
    }
  });
});

describe("listLeads database errors", () => {
  it("returns a safe error when the database query fails", async () => {
    const databaseError = new Prisma.PrismaClientKnownRequestError("connection failed", {
      code: "P1001",
      clientVersion: "test",
    });

    const db = {
      lead: prisma.lead,
      $transaction: () => Promise.reject(databaseError),
    };

    await assert.rejects(
      () => listLeads({ page: 1, limit: 20 }, db),
      (error: unknown) => error instanceof HttpError && error.statusCode === 500,
    );
  });
});
