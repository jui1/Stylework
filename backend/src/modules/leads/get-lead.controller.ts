import type { Request, Response } from "express";
import { leadIdParamsSchema } from "./get-lead.schema.js";
import { getLeadById } from "./lead.service.js";

export async function getLead(request: Request, response: Response): Promise<void> {
  const { id } = leadIdParamsSchema.parse(request.params);
  const lead = await getLeadById(id);

  response.status(200).json(lead);
}