import { Router } from "express";

import authRoutes from "./auth.routes";
import employeeRoutes from "./employee.routes";
import departmentRoutes from "./department.routes";
import shiftRoutes from "./shift.routes";
import attendanceRoutes from "./attendance.routes";
import dashboardRoutes from "./dashboard.routes";
import leaveRoutes from "./leave.routes";
import holidayRoutes from "./holiday.routes";

const router = Router();

router.use("/auth", authRoutes);

router.use("/employees", employeeRoutes);

router.use("/departments", departmentRoutes);

router.use("/shifts", shiftRoutes);

router.use("/attendance", attendanceRoutes);

router.use("/dashboard", dashboardRoutes);

router.use("/leaves", leaveRoutes);

router.use("/holidays", holidayRoutes);

export default router;