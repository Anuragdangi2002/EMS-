import { z } from "zod";

const requiredString = (field: string, max: number) =>
  z
    .string()
    .trim()
    .min(1, `${field} is required`)
    .max(max, `${field} cannot exceed ${max} characters`);

export const createHolidaySchema = z.object({
  title: requiredString("Title", 100),
  date: z.string().min(1, "Date is required"),
  description: z.string().max(255).optional().nullable(),
  isOptional: z.boolean().default(false),
});

export const updateHolidaySchema = createHolidaySchema.partial();

export const holidayIdParamsSchema = z.object({
  id: z.string().uuid("Invalid Holiday ID"),
});
