import { Router } from "express";

import { attendanceController } from "../controllers/attendance.controller";

import { authenticate } from "../middlewares/authenticate.middleware";

import { authorize } from "../middlewares/authorize.middleware";

import { Role } from "@prisma/client";

import { validate } from "../middlewares/validate.middleware";

import {
  checkInSchema,
  checkOutSchema,
} from "../validations/attendance.validation";

const router = Router();

/**
 * Employee Check In
 */
router.post(
  "/check-in",
  authenticate,
  validate({ body: checkInSchema }),
  attendanceController.checkIn
);

/**
 * Employee Check Out
 */
router.post(
  "/check-out",
  authenticate,
  validate({ body: checkOutSchema }),
  attendanceController.checkOut
);

/**
 * HR/Admin Attendance List
 */
router.get(
  "/",
  authenticate,
  authorize(Role.DIRECTOR, Role.HR, Role.MANAGER),
  attendanceController.getAttendanceList
);

/**
 * Employee Attendance History
 */
router.get(
  "/employee/:employeeId",
  authenticate,
  attendanceController.getEmployeeAttendance
);

export default router;