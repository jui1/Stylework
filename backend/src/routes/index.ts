import { Router } from "express";
import { healthRouter } from "./health.route.js";
import { leadsRouter } from "./leads.route.js";
import { webhookRouter } from "./webhook.route.js";

export const routes = Router();

routes.use(healthRouter);
routes.use(webhookRouter);
routes.use(leadsRouter);
