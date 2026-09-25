import { Router } from "express";
import { getLead } from "../modules/leads/get-lead.controller.js";
import { getLeads } from "../modules/leads/list-leads.controller.js";

export const leadsRouter = Router();

leadsRouter.get("/leads", getLeads);
leadsRouter.get("/leads/:id", getLead);
