import { z } from "zod";

const requiredString = (field: string, max: number) =>
  z
    .string()
    .trim()
    .min(1, `${field} is required`)
    .max(max, `${field} cannot exceed ${max} characters`);

export const createShiftSchema = z.object({
  name: requiredString("Shift Name", 100),

  startTime: requiredString("Start Time", 10),

  endTime: requiredString("End Time", 10),

  gracePeriod: z
    .number()
    .int()
    .min(0)
    .default(15),
});

export const updateShiftSchema =
  createShiftSchema.partial();

export const shiftIdParamsSchema = z.object({
  id: z.string().uuid("Invalid Shift ID"),
});