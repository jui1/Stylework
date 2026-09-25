import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, describe, it } from "node:test";
import request from "supertest";
import { createApp } from "../../app.js";
import { prisma } from "../../lib/prisma.js";

const app = createApp();

describe("PATCH /leads/:id/status", () => {
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
    const externalLeadId = `test-status-${randomUUID()}`;
    createdIds.push(externalLeadId);

    return prisma.lead.create({
      data: {
        externalLeadId,
        name: "Status Lead",
        source: "meta",
        status: "NEW",
      },
    });
  }

  it("updates the status and appends a STATUS_CHANGED activity", async () => {
    const lead = await createLead();

    const response = await request(app)
      .patch(`/leads/${lead.id}/status`)
      .send({ status: "CONTACTED" });

    assert.equal(response.status, 200);
    assert.equal(response.body.status, "CONTACTED");

    const activities = await prisma.activity.findMany({
      where: { leadId: lead.id },
      orderBy: { createdAt: "desc" },
    });

    assert.equal(activities.length, 1);
    assert.equal(activities[0]?.type, "STATUS_CHANGED");
    assert.deepEqual(activities[0]?.metadata, {
      previousStatus: "NEW",
      newStatus: "CONTACTED",
    });
  });

  it("does not create an activity when the status is unchanged", async () => {
    const lead = await createLead();

    await request(app).patch(`/leads/${lead.id}/status`).send({ status: "QUALIFIED" });
    const response = await request(app)
      .patch(`/leads/${lead.id}/status`)
      .send({ status: "QUALIFIED" });

    assert.equal(response.status, 200);
    assert.equal(response.body.status, "QUALIFIED");

    const activities = await prisma.activity.findMany({ where: { leadId: lead.id } });
    assert.equal(activities.length, 1);
    assert.equal(activities[0]?.type, "STATUS_CHANGED");
  });

  it("returns 404 when the lead does not exist", async () => {
    const response = await request(app)
      .patch(`/leads/${randomUUID()}/status`)
      .send({ status: "CONTACTED" });

    assert.equal(response.status, 404);
    assert.equal(response.body.error, "Lead not found");
  });

  it("rejects an invalid status", async () => {
    const lead = await createLead();

    const response = await request(app)
      .patch(`/leads/${lead.id}/status`)
      .send({ status: "ARCHIVED" });

    assert.equal(response.status, 400);
    assert.equal(response.body.error, "Invalid payload");

    const stored = await prisma.lead.findUnique({ where: { id: lead.id } });
    const activities = await prisma.activity.count({ where: { leadId: lead.id } });
    assert.equal(stored?.status, "NEW");
    assert.equal(activities, 0);
  });
});
