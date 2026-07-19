import { Router } from "express";

import { Role } from "@prisma/client";

import { leaveController } from "../controllers/leave.controller";

import { authenticate } from "../middlewares/authenticate.middleware";

import { authorize } from "../middlewares/authorize.middleware";

import { validate } from "../middlewares/validate.middleware";

import {
  applyLeaveSchema,
  updateLeaveStatusSchema,
} from "../validations/leave.validation";

const router = Router();

/**
 * Apply Leave
 */
router.post(
  "/",
  authenticate,
  validate({
    body: applyLeaveSchema,
  }),
  leaveController.applyLeave
);

/**
 * Get All Leaves
 */
router.get(
  "/",
  authenticate,
  authorize(Role.DIRECTOR, Role.HR, Role.MANAGER, Role.EMPLOYEE),
  leaveController.getAllLeaves
);

/**
 * Approve / Reject Leave
 */
router.patch(
  "/:id/status",
  authenticate,
  authorize(Role.DIRECTOR, Role.HR, Role.MANAGER),
  validate({
    body: updateLeaveStatusSchema,
  }),
  leaveController.updateLeaveStatus
);

export default router;