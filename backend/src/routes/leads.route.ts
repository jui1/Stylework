import { Router } from "express";
import { validate } from "../middleware/validate.js";
import { getLead } from "../modules/leads/get-lead.controller.js";
import { leadIdParamsSchema } from "../modules/leads/get-lead.schema.js";
import { getLeads } from "../modules/leads/list-leads.controller.js";
import { leadListQuerySchema } from "../modules/leads/list-leads.schema.js";
import { patchLead } from "../modules/leads/update-lead.controller.js";
import { updateLeadSchema } from "../modules/leads/update-lead.schema.js";
import { patchLeadStatus } from "../modules/leads/update-lead-status.controller.js";
import { updateLeadStatusSchema } from "../modules/leads/update-lead-status.schema.js";

export const leadsRouter = Router();

leadsRouter.get("/leads", validate({ query: leadListQuerySchema }), getLeads);
leadsRouter.get("/leads/:id", validate({ params: leadIdParamsSchema }), getLead);
leadsRouter.patch("/leads/:id", validate({ params: leadIdParamsSchema, body: updateLeadSchema }), patchLead);
leadsRouter.patch(
  "/leads/:id/status",
  validate({ params: leadIdParamsSchema, body: updateLeadStatusSchema }),
  patchLeadStatus,
);
