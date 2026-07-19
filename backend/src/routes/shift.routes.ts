import { Router } from "express";
import { shiftController } from "../controllers/shift.controller";
import { Role } from "@prisma/client";

import { authenticate } from "../middlewares/authenticate.middleware";
import { authorize } from "../middlewares/authorize.middleware";
import { validate } from "../middlewares/validate.middleware";

import {
  createShiftSchema,
  updateShiftSchema,
  shiftIdParamsSchema,
} from "../validations/shift.validation";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize(Role.DIRECTOR, Role.HR),
  validate({
    body: createShiftSchema,
  }),
  shiftController.createShift
);

router.get(
  "/",
  authenticate,
  shiftController.getAllShifts
);

router.get(
  "/:id",
  authenticate,
  validate({
    params: shiftIdParamsSchema,
  }),
  shiftController.getShiftById
);

router.put(
  "/:id",
  authenticate,
  authorize(Role.DIRECTOR, Role.HR),
  validate({
    params: shiftIdParamsSchema,
    body: updateShiftSchema,
  }),
  shiftController.updateShift
);

router.delete(
  "/:id",
  authenticate,
  authorize(Role.DIRECTOR, Role.HR),
  validate({
    params: shiftIdParamsSchema,
  }),
  shiftController.deleteShift
);

export default router;