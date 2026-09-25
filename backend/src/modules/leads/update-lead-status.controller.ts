import type { Request, Response } from "express";
import { leadIdParamsSchema } from "./get-lead.schema.js";
import { updateLeadStatus } from "./lead.service.js";
import { updateLeadStatusSchema } from "./update-lead-status.schema.js";

export async function patchLeadStatus(request: Request, response: Response): Promise<void> {
  const { id } = leadIdParamsSchema.parse(request.params);
  const input = updateLeadStatusSchema.parse(request.body);
  const lead = await updateLeadStatus(id, input);

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
