import { AttendanceStatus, Role } from "@prisma/client";
import { prisma } from "../config/prisma";
import { employeeRepository } from "../repositories/employee.repository";

export class DashboardRepository {
  async getCounts(currentUser?: { userId: string; role: Role }) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let managerEmployeeId: string | undefined;

    // If the requester is a MANAGER, scope counts to subordinates only
    if (currentUser && currentUser.role === Role.MANAGER) {
      const managerEmployee = await employeeRepository.findByUserId(
        currentUser.userId
      );
      managerEmployeeId = managerEmployee?.id;
    }

    const employeeFilter = managerEmployeeId
      ? { managerId: managerEmployeeId }
      : {};

    const [
      totalEmployees,
      activeEmployees,
      departments,
      shifts,
      presentToday,
      lateToday,
      employeesOnLeave,
    ] = await Promise.all([
      prisma.employee.count({ where: employeeFilter }),

      prisma.employee.count({
        where: {
          ...employeeFilter,
          isActive: true,
        },
      }),

      // Departments and shifts are global — not scoped to manager
      prisma.department.count({
        where: {
          isActive: true,
        },
      }),

      prisma.shift.count({
        where: {
          isActive: true,
        },
      }),

      prisma.attendance.count({
        where: {
          date: today,
          status: AttendanceStatus.PRESENT,
          ...(managerEmployeeId
            ? { employee: { managerId: managerEmployeeId } }
            : {}),
        },
      }),

      prisma.attendance.count({
        where: {
          date: today,
          status: AttendanceStatus.LATE,
          ...(managerEmployeeId
            ? { employee: { managerId: managerEmployeeId } }
            : {}),
        },
      }),

      prisma.leave.count({
        where: {
          status: "APPROVED",
          startDate: {
            lte: today,
          },
          endDate: {
            gte: today,
          },
          ...(managerEmployeeId
            ? { employee: { managerId: managerEmployeeId } }
            : {}),
        },
      }),
    ]);

    return {
      totalEmployees,
      activeEmployees,
      departments,
      shifts,
      presentToday,
      lateToday,
      absentToday:
        activeEmployees -
        presentToday -
        lateToday -
        employeesOnLeave,
      employeesOnLeave,
    };
  }
}

export const dashboardRepository =
  new DashboardRepository();