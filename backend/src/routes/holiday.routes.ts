import { Router } from "express";
import { holidayController } from "../controllers/holiday.controller";
import { Role } from "@prisma/client";

import { authenticate } from "../middlewares/authenticate.middleware";
import { authorize } from "../middlewares/authorize.middleware";
import { validate } from "../middlewares/validate.middleware";

import {
  createHolidaySchema,
  updateHolidaySchema,
  holidayIdParamsSchema,
} from "../validations/holiday.validation";

const router = Router();

/**
 * Create Holiday
 */
router.post(
  "/",
  authenticate,
  authorize(Role.DIRECTOR, Role.HR),
  validate({
    body: createHolidaySchema,
  }),
  holidayController.createHoliday
);

/**
 * Get All Holidays
 */
router.get(
  "/",
  authenticate,
  holidayController.getAllHolidays
);

/**
 * Get Holiday By ID
 */
router.get(
  "/:id",
  authenticate,
  validate({
    params: holidayIdParamsSchema,
  }),
  holidayController.getHolidayById
);

/**
 * Update Holiday
 */
router.put(
  "/:id",
  authenticate,
  authorize(Role.DIRECTOR, Role.HR),
  validate({
    params: holidayIdParamsSchema,
    body: updateHolidaySchema,
  }),
  holidayController.updateHoliday
);

/**
 * Delete Holiday
 */
router.delete(
  "/:id",
  authenticate,
  authorize(Role.DIRECTOR, Role.HR),
  validate({
    params: holidayIdParamsSchema,
  }),
  holidayController.deleteHoliday
);

export default router;
