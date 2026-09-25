import { Router, type RequestHandler } from "express";
import { postMetaLead } from "../modules/leads/meta-lead.controller.js";
import { metaLeadWebhookSchema } from "../modules/leads/meta-lead.schema.js";
import { validate } from "../middleware/validate.js";

export function createWebhookRouter(rateLimit: RequestHandler) {
  const webhookRouter = Router();

  webhookRouter.post(
    "/webhook/meta-lead",
    rateLimit,
    validate({ body: metaLeadWebhookSchema }),
    postMetaLead,
  );

  return webhookRouter;
}
