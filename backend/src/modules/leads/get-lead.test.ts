import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, describe, it } from "node:test";
import { Prisma } from "@prisma/client";
import request from "supertest";
import { createApp } from "../../app.js";
import { HttpError } from "../../errors/http-error.js";
import { prisma } from "../../lib/prisma.js";
import { getLeadById } from "./lead.service.js";

const app = createApp();

describe("GET /leads/:id", () => {
  const createdIds: string[] = [];

  after(async () => {
    if (createdIds.length > 0) {
      await prisma.lead.deleteMany({
        where: { externalLeadId: { in: createdIds } },
      });
    }

    await prisma.$disconnect();
  });

  it("returns the lead and activities newest first", async () => {
    const externalLeadId = `test-lead-${randomUUID()}`;
    createdIds.push(externalLeadId);
    const base = new Date("2030-02-01T00:00:00.000Z");

    const lead = await prisma.lead.create({
      data: {
        externalLeadId,
        name: "Grace Hopper",
        email: "grace@example.com",
        source: "meta",
        activities: {
          create: [
            {
              type: "LEAD_CREATED",
              description: "Lead created",
              createdAt: base,
            },
            {
              type: "CALL",
              description: "Follow-up call",
              createdAt: new Date(base.getTime() + 2_000),
            },
            {
              type: "NOTE",
              description: "Internal note",
              createdAt: new Date(base.getTime() + 1_000),
            },
          ],
        },
      },
    });

    const response = await request(app).get(`/leads/${lead.id}`);

    assert.equal(response.status, 200);
    assert.equal(response.body.id, lead.id);
    assert.equal(response.body.externalLeadId, externalLeadId);
    assert.equal(response.body.name, "Grace Hopper");
    assert.deepEqual(
      response.body.activities.map((activity: { type: string }) => activity.type),
      ["CALL", "NOTE", "LEAD_CREATED"],
    );
  });

  it("rejects an invalid id", async () => {
    const response = await request(app).get("/leads/not-a-uuid");

    assert.equal(response.status, 400);
    assert.equal(response.body.error, "Invalid payload");
  });

  it("returns 404 when the lead does not exist", async () => {
    const response = await request(app).get(`/leads/${randomUUID()}`);

    assert.equal(response.status, 404);
    assert.equal(response.body.error, "Lead not found");
  });
});

describe("getLeadById database errors", () => {
  it("returns a safe error when the database query fails", async () => {
    const databaseError = new Prisma.PrismaClientKnownRequestError("connection failed", {
      code: "P1001",
      clientVersion: "test",
    });

    const db = {
      lead: {
        findUnique: () => Promise.reject(databaseError),
      },
    };

    await assert.rejects(
      () => getLeadById(randomUUID(), db as never),
      (error: unknown) =>
        error instanceof HttpError &&
        error.statusCode === 500 &&
        error.message === "Unable to load lead",
    );
  });
});
