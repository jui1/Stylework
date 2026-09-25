import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, before, describe, it } from "node:test";
import request from "supertest";
import { createApp } from "../../app.js";
import { prisma } from "../../lib/prisma.js";

const app = createApp();

function payload(externalLeadId: string) {
  return {
    externalLeadId,
    name: "Ada Lovelace",
    email: "ada@example.com",
    phone: "+15551212",
    source: "meta",
  };
}

describe("POST /webhook/meta-lead", () => {
  const createdIds: string[] = [];

  before(() => {
    process.env.NODE_ENV ??= "test";
  });

  after(async () => {
    if (createdIds.length > 0) {
      await prisma.lead.deleteMany({
        where: { externalLeadId: { in: createdIds } },
      });
    }

    await prisma.$disconnect();
  });

  it("creates a lead and a LEAD_CREATED activity", async () => {
    const externalLeadId = `test-${randomUUID()}`;
    createdIds.push(externalLeadId);

    const response = await request(app).post("/webhook/meta-lead").send(payload(externalLeadId));

    assert.equal(response.status, 201);
    assert.equal(response.body.externalLeadId, externalLeadId);
    assert.equal(response.body.status, "NEW");

    const lead = await prisma.lead.findUnique({
      where: { externalLeadId },
      include: { activities: true },
    });

    assert.ok(lead);
    assert.equal(lead.activities.length, 1);
    assert.equal(lead.activities[0]?.type, "LEAD_CREATED");
    assert.equal(lead.activities[0]?.description, "Lead created from Meta webhook");
  });

  it("rejects an invalid payload", async () => {
    const externalLeadId = `test-${randomUUID()}`;

    const response = await request(app).post("/webhook/meta-lead").send({
      externalLeadId,
      email: "not-an-email",
    });

    assert.equal(response.status, 400);
    assert.equal(response.body.error, "Invalid payload");

    const lead = await prisma.lead.findUnique({ where: { externalLeadId } });
    assert.equal(lead, null);
  });

  it("rejects a duplicate externalLeadId", async () => {
    const externalLeadId = `test-${randomUUID()}`;
    createdIds.push(externalLeadId);
    const body = payload(externalLeadId);

    const created = await request(app).post("/webhook/meta-lead").send(body);
    const duplicate = await request(app).post("/webhook/meta-lead").send(body);

    assert.equal(created.status, 201);
    assert.equal(duplicate.status, 409);
    assert.match(duplicate.body.error, /externalLeadId/);

    const leads = await prisma.lead.findMany({
      where: { externalLeadId },
      include: { activities: true },
    });

    assert.equal(leads.length, 1);
    assert.equal(leads[0]?.activities.length, 1);
  });
});
