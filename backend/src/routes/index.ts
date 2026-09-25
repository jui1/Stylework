import { Router } from "express";
import { healthRouter } from "./health.route.js";
import { webhookRouter } from "./webhook.route.js";

export const routes = Router();

routes.use(healthRouter);
routes.use(webhookRouter);
