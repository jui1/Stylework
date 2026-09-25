import { Router } from "express";
import { getLeads } from "../modules/leads/list-leads.controller.js";

export const leadsRouter = Router();

leadsRouter.get("/leads", getLeads);
