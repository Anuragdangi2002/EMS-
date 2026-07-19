import { Router } from "express";

import { dashboardController } from "../controllers/dashboard.controller";

import { authenticate } from "../middlewares/authenticate.middleware";

import { authorize } from "../middlewares/authorize.middleware";

import { Role } from "@prisma/client";

const router = Router();

router.get(
  "/",
  authenticate,
  authorize(Role.DIRECTOR, Role.HR, Role.MANAGER),
  dashboardController.getDashboard
);

export default router;