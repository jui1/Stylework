import type { Request, Response } from "express";
import { createLeadFromMetaWebhook } from "./lead.service.js";
import { metaLeadWebhookSchema } from "./meta-lead.schema.js";

export async function postMetaLead(request: Request, response: Response): Promise<void> {
  const input = metaLeadWebhookSchema.parse(request.body);
  const lead = await createLeadFromMetaWebhook(input);

  response.status(201).json({
    id: lead.id,
    externalLeadId: lead.externalLeadId,
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    source: lead.source,
    status: lead.status,
  });
}
