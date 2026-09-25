import { z } from "zod";

const leadStatuses = [
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "UNQUALIFIED",
  "CONVERTED",
  "LOST",
] as const;

export const updateLeadStatusSchema = z.object({
  status: z.enum(leadStatuses),
});

export type UpdateLeadStatusInput = z.infer<typeof updateLeadStatusSchema>;
