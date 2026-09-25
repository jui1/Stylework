import { z } from "zod";

export const updateLeadSchema = z
  .object({
    name: z.string().trim().min(1).max(200).optional(),
    email: z.union([z.string().trim().email().max(320), z.null()]).optional(),
    phone: z.union([z.string().trim().min(1).max(32), z.null()]).optional(),
  })
  .refine((value) => value.name !== undefined || value.email !== undefined || value.phone !== undefined, {
    message: "At least one field is required",
  });

export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;
