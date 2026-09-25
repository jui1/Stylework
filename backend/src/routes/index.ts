import { Router, type RequestHandler } from "express";
import { healthRouter } from "./health.route.js";
import { leadsRouter } from "./leads.route.js";
import { createWebhookRouter } from "./webhook.route.js";

export function createRoutes(webhookRateLimit: RequestHandler) {
  const routes = Router();

  routes.use(healthRouter);
  routes.use(createWebhookRouter(webhookRateLimit));
  routes.use(leadsRouter);

  return routes;
}
