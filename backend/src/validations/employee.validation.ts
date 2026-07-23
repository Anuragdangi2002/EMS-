import { z } from "zod";
import { Gender, EmploymentType, Role } from "@prisma/client";

const uuidSchema = z.string().uuid("Invalid User ID");

const employeeCodeSchema = z
  .string()
  .min(1, "Employee code is required")
  .max(20, "Employee code cannot exceed 20 characters");

const requiredString = (field: string, max: number) =>
  z
    .string()
    .min(1, `${field} is required`)
    .max(max, `${field} cannot exceed ${max} characters`);


    export const createEmployeeSchema = z.object({
  employeeCode: employeeCodeSchema,

  userId: uuidSchema,

  firstName: requiredString("First Name", 50),

  lastName: requiredString("Last Name", 50),

  phone: requiredString("Phone", 20),

  dateOfBirth: z.coerce.date(),

  gender: z.nativeEnum(Gender),

  joiningDate: z.coerce.date(),

  employmentType: z.nativeEnum(EmploymentType),

  designation: requiredString("Designation", 100),

  department: requiredString("Department", 100),

  address: requiredString("Address", 255),

  city: requiredString("City", 100),

  state: requiredString("State", 100),

  country: requiredString("Country", 100),

  postalCode: requiredString("Postal Code", 20),

  profileImageUrl: z.string().url().optional(),

  managerId: z.string().uuid("Invalid manager ID").optional().nullable(),

  role: z.nativeEnum(Role).optional(),

  salary: z.coerce.number().optional().nullable(),

  workFromHome: z.boolean().optional(),

  shortLeaves: z.coerce.number().int().optional(),

  allocatedLeaves: z.coerce.number().optional(),

  leaveBalance: z.coerce.number().optional()
});

export const updateEmployeeSchema = createEmployeeSchema.partial();

export const employeeIdParamsSchema = z.object({
  id: z.string().uuid("Invalid employee ID")
});