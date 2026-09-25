import { Prisma } from "@prisma/client";
import type { PrismaClient } from "@prisma/client";
import { ConflictError, HttpError } from "../../errors/http-error.js";
import { logger } from "../../lib/logger.js";
import { prisma } from "../../lib/prisma.js";
import type { LeadListQuery } from "./list-leads.schema.js";
import type { MetaLeadWebhookInput } from "./meta-lead.schema.js";

type LeadListDb = Pick<PrismaClient, "$transaction" | "lead">;

function isDatabaseError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError ||
    error instanceof Prisma.PrismaClientUnknownRequestError ||
    error instanceof Prisma.PrismaClientInitializationError ||
    error instanceof Prisma.PrismaClientRustPanicError ||
    error instanceof Prisma.PrismaClientValidationError
  );
}

export async function createLeadFromMetaWebhook(input: MetaLeadWebhookInput) {
  try {
    return await prisma.$transaction(async (tx) => {
      const lead = await tx.lead.create({
        data: {
          externalLeadId: input.externalLeadId,
          name: input.name,
          email: input.email,
          phone: input.phone,
          source: input.source,
        },
      });

      await tx.activity.create({
        data: {
          leadId: lead.id,
          type: "LEAD_CREATED",
          description: "Lead created from Meta webhook",
          metadata: input,
        },
      });

      return lead;
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new ConflictError("A lead with this externalLeadId already exists");
    }

    throw error;
  }
}

export async function listLeads(query: LeadListQuery, db: LeadListDb = prisma) {
  const skip = (query.page - 1) * query.limit;

  try {
    const [total, data] = await db.$transaction([
      db.lead.count(),
      db.lead.findMany({
        orderBy: { createdAt: "desc" },
        skip,
        take: query.limit,
      }),
    ]);

    return {
      data,
      page: query.page,
      limit: query.limit,
      total,
    };
  } catch (error) {
    if (isDatabaseError(error)) {
      logger.error({ err: error }, "failed to list leads");
      throw new HttpError(500, "Unable to load leads");
    }

    throw error;
  }
}
