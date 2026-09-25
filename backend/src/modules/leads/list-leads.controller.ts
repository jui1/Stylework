import type { Request, Response } from "express";
import { leadListQuerySchema } from "./list-leads.schema.js";
import { listLeads } from "./lead.service.js";

export async function getLeads(request: Request, response: Response): Promise<void> {
  const query = leadListQuerySchema.parse(request.query);
  const result = await listLeads(query);

  response.status(200).json(result);
}
