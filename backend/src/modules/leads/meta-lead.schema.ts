import { z } from "zod";

export const metaLeadWebhookSchema = z.object({
  externalLeadId: z.string().trim().min(1).max(128),
  name: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(320).optional(),
  phone: z.string().trim().min(1).max(32).optional(),
  source: z.string().trim().min(1).max(100),
});

export type MetaLeadWebhookInput = z.infer<typeof metaLeadWebhookSchema>;
