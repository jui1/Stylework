import type { Request, Response } from "express";
import { leadIdParamsSchema } from "./get-lead.schema.js";
import { updateLead } from "./lead.service.js";
import { updateLeadSchema } from "./update-lead.schema.js";

export async function patchLead(request: Request, response: Response): Promise<void> {
  const { id } = leadIdParamsSchema.parse(request.params);
  const input = updateLeadSchema.parse(request.body);
  const lead = await updateLead(id, input);

  response.status(200).json({
    id: lead.id,
    externalLeadId: lead.externalLeadId,
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    source: lead.source,
    status: lead.status,
  });
}
