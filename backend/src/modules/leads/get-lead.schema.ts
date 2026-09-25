import { z } from "zod";

export const leadIdParamsSchema = z.object({
  id: z.string().uuid(),
});

export type LeadIdParams = z.infer<typeof leadIdParamsSchema>;
