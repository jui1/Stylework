import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, describe, it } from "node:test";
import request from "supertest";
import { createApp } from "../../app.js";
import { prisma } from "../../lib/prisma.js";

const app = createApp();

describe("PATCH /leads/:id", () => {
  const createdIds: string[] = [];

  after(async () => {
    if (createdIds.length > 0) {
      await prisma.lead.deleteMany({
        where: { externalLeadId: { in: createdIds } },
      });
    }

    await prisma.$disconnect();
  });

  async function createLead() {
    const externalLeadId = `test-update-${randomUUID()}`;
    createdIds.push(externalLeadId);

    return prisma.lead.create({
      data: {
        externalLeadId,
        name: "Original Name",
        email: "original@example.com",
        phone: "+15550001",
        source: "meta",
      },
    });
  }

  it("updates changed fields and appends one LEAD_UPDATED activity", async () => {
    const lead = await createLead();

    const response = await request(app).patch(`/leads/${lead.id}`).send({
      name: "Updated Name",
      phone: "+15550002",
    });

    assert.equal(response.status, 200);
    assert.equal(response.body.name, "Updated Name");
    assert.equal(response.body.phone, "+15550002");
    assert.equal(response.body.email, "original@example.com");

    const activities = await prisma.activity.findMany({ where: { leadId: lead.id } });
    assert.equal(activities.length, 1);
    assert.equal(activities[0]?.type, "LEAD_UPDATED");
    assert.deepEqual(activities[0]?.metadata, {
      changes: {
        name: { previous: "Original Name", next: "Updated Name" },
        phone: { previous: "+15550001", next: "+15550002" },
      },
    });
  });

  it("does not create an activity when the submitted values are unchanged", async () => {
    const lead = await createLead();

    const response = await request(app).patch(`/leads/${lead.id}`).send({
      name: "Original Name",
      email: "original@example.com",
    });

    assert.equal(response.status, 200);
    const activities = await prisma.activity.count({ where: { leadId: lead.id } });
    assert.equal(activities, 0);
  });

  it("returns 404 when the lead does not exist", async () => {
    const response = await request(app).patch(`/leads/${randomUUID()}`).send({ name: "Missing" });

    assert.equal(response.status, 404);
    assert.equal(response.body.error, "Lead not found");
  });
});
