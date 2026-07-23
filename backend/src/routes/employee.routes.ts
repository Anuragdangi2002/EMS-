import { Router } from "express";
import { Role } from "@prisma/client";

import { employeeController } from "../controllers/employee.controller";

import { authenticate } from "../middlewares/authenticate.middleware";
import { authorize } from "../middlewares/authorize.middleware";
import { validate } from "../middlewares/validate.middleware";

import {
  createEmployeeSchema,
  updateEmployeeSchema,
} from "../validations/employee.validation";

const router = Router();

/**
 * Create Employee
 * Only ADMIN and HR
 */
router.post(
  "/",
  authenticate,
  authorize(Role.DIRECTOR, Role.HR),
  validate({ body: createEmployeeSchema }),
  employeeController.createEmployee
);

/**
 * Get all Employees
 * Only ADMIN and HR
 */
router.get(
  "/",
  authenticate,
  authorize(Role.DIRECTOR, Role.HR, Role.MANAGER),
  employeeController.getAllEmployees
);

/**
 * Get Logged-in Employee Profile
 */
router.get(
  "/me",
  authenticate,
  employeeController.getCurrentEmployee
);

/**
 * Get Logged-in Employee's Team
 */
router.get(
  "/my-team",
  authenticate,
  employeeController.getMyTeam
);

/**
 * Get Employee By ID
 * Only ADMIN and HR
 */
router.get(
  "/:id",
  authenticate,
  authorize(Role.DIRECTOR, Role.HR, Role.MANAGER),
  employeeController.getEmployeeById
);

/**
 * Update Employee
 * Only ADMIN and HR
 */
router.put(
  "/:id",
  authenticate,
  authorize(Role.DIRECTOR, Role.HR, Role.MANAGER),
  validate({ body: updateEmployeeSchema }),
  employeeController.updateEmployee
);

/**
 * Soft Delete Employee
 * Only ADMIN
 */
router.delete(
  "/:id",
  authenticate,
  authorize(Role.DIRECTOR),
  employeeController.deleteEmployee
);

export default router;