import { Router } from "express";
import { departmentController } from "../controllers/department.controller";
import { Role } from "@prisma/client";

import { authenticate } from "../middlewares/authenticate.middleware";
import { authorize } from "../middlewares/authorize.middleware";
import { validate } from "../middlewares/validate.middleware";

import {
  createDepartmentSchema,
  updateDepartmentSchema,
  departmentIdParamsSchema,
} from "../validations/department.validation";

const router = Router();

/**
 * Create Department
 */
router.post(
  "/",
  authenticate,
  authorize(Role.DIRECTOR, Role.HR),
  validate({
    body: createDepartmentSchema,
  }),
  departmentController.createDepartment
);

/**
 * Get All Departments
 */
router.get(
  "/",
  authenticate,
  departmentController.getAllDepartments
);

/**
 * Get Department By ID
 */
router.get(
  "/:id",
  authenticate,
  validate({
    params: departmentIdParamsSchema,
  }),
  departmentController.getDepartmentById
);

/**
 * Update Department
 */
router.put(
  "/:id",
  authenticate,
  authorize(Role.DIRECTOR, Role.HR),
  validate({
    params: departmentIdParamsSchema,
    body: updateDepartmentSchema,
  }),
  departmentController.updateDepartment
);

/**
 * Delete Department
 */
router.delete(
  "/:id",
  authenticate,
  authorize(Role.DIRECTOR, Role.HR),
  validate({
    params: departmentIdParamsSchema,
  }),
  departmentController.deleteDepartment
);

export default router;