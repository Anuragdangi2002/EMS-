import { z } from "zod";

export const applyLeaveSchema = z.object({
  employeeId: z.string().uuid(),

  startDate: z.coerce.date(),

  endDate: z.coerce.date(),

  reason: z
    .string()
    .min(5)
    .max(255),
});

export const updateLeaveStatusSchema = z.object({
  status: z.enum([
    "APPROVED",
    "REJECTED",
  ]),
});