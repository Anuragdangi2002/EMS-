import { z } from "zod";

const requiredString = (field: string, max: number) =>
  z
    .string()
    .trim()
    .min(1, `${field} is required`)
    .max(max, `${field} cannot exceed ${max} characters`);

export const createDepartmentSchema = z.object({
  name: requiredString("Department Name", 100),

  code: requiredString("Department Code", 20),

  description: z
    .string()
    .trim()
    .max(255)
    .optional(),
});

export const updateDepartmentSchema =
  createDepartmentSchema.partial();

export const departmentIdParamsSchema = z.object({
  id: z.string().uuid("Invalid department ID"),
});