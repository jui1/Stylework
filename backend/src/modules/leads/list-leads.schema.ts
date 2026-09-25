import { z } from "zod";

export const leadListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type LeadListQuery = z.infer<typeof leadListQuerySchema>;
