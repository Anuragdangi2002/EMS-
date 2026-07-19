import { z } from "zod";

export const checkInSchema = z.object({
  employeeId: z.string().uuid("Invalid employee ID"),
});

export const checkOutSchema = z.object({
  employeeId: z.string().uuid("Invalid employee ID"),
});

export const attendanceIdParamsSchema = z.object({
  id: z.string().uuid("Invalid attendance ID"),
});

export const attendanceQuerySchema = z.object({
  employeeId: z.string().uuid().optional(),

  from: z.string().optional(),

  to: z.string().optional(),
});