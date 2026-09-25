import { Router } from "express";
import { postMetaLead } from "../modules/leads/meta-lead.controller.js";

export const webhookRouter = Router();

webhookRouter.post("/webhook/meta-lead", postMetaLead);
