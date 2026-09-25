import { Prisma } from "@prisma/client";
import { ConflictError } from "../../errors/http-error.js";
import { prisma } from "../../lib/prisma.js";
import type { MetaLeadWebhookInput } from "./meta-lead.schema.js";

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
