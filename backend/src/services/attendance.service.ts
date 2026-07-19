import { AttendanceStatus, Role } from "@prisma/client";

import { attendanceRepository } from "../repositories/attendance.repository";

import { prisma } from "../config/prisma";

import { employeeRepository } from "../repositories/employee.repository";

import {
  ConflictError,
  NotFoundError,
  ForbiddenError,
} from "../utils/error.util";

export class AttendanceService {
  /**
   * Employee Check In
   */
  async checkIn(employeeId: string) {
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const existing =
      await attendanceRepository.findTodayAttendance(
        employeeId,
        today
      );

    if (existing) {
      throw new ConflictError(
        "You have already checked in today."
      );
    }

    const employee =
      await attendanceRepository.getEmployeeWithShift(
        employeeId
      );

    if (!employee) {
      throw new NotFoundError("Employee not found");
    }

    const now = new Date();

    let status: AttendanceStatus = AttendanceStatus.PRESENT;

    let isLate = false;

    if (employee.shift) {
      const [hour, minute] =
        employee.shift.startTime
          .split(":")
          .map(Number);

      const shiftStart = new Date(now);

      shiftStart.setHours(hour, minute, 0, 0);

      shiftStart.setMinutes(
        shiftStart.getMinutes() +
          employee.shift.gracePeriod
      );

      if (now > shiftStart) {
        status = AttendanceStatus.LATE;
        isLate = true;
      }
    }

    return attendanceRepository.create({
      employee: {
        connect: {
          id: employeeId,
        },
      },

      date: today,

      checkIn: now,

      status,

      isLate,
    });
  }

  /**
   * Employee Check Out
   */
  async checkOut(employeeId: string) {
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const attendance =
      await attendanceRepository.findTodayAttendance(
        employeeId,
        today
      );

    if (!attendance) {
      throw new NotFoundError(
        "No check-in found for today."
      );
    }

    if (attendance.checkOut) {
      throw new ConflictError(
        "Already checked out."
      );
    }

    const checkOutTime = new Date();

    const totalHours =
      (checkOutTime.getTime() -
        attendance.checkIn!.getTime()) /
      (1000 * 60 * 60);

    const overtimeHours =
      totalHours > 8
        ? totalHours - 8
        : 0;

    return attendanceRepository.update(
      attendance.id,
      {
        checkOut: checkOutTime,

        totalHours:
          Math.round(totalHours * 100) / 100,

        overtimeHours:
          Math.round(overtimeHours * 100) /
          100,
      }
    );
  }

  /**
   * Attendance List (scoped by role).
   * - DIRECTOR / HR: all attendance records.
   * - MANAGER: only records for employees assigned to this manager.
   */
  async getAttendanceList(currentUser?: { userId: string; role: Role }) {
    if (currentUser && currentUser.role === Role.MANAGER) {
      const managerEmployee = await employeeRepository.findByUserId(
        currentUser.userId
      );
      if (!managerEmployee) {
        return [];
      }
      // Return attendance for subordinate employees only
      return prisma.attendance.findMany({
        where: {
          employee: {
            managerId: managerEmployee.id,
            isActive: true,
          },
        },
        include: {
          employee: true,
        },
        orderBy: {
          date: "desc",
        },
      });
    }
    return attendanceRepository.findAll();
  }

  /**
   * Employee Attendance History.
   * - DIRECTOR / HR: can view any employee's history.
   * - MANAGER: can only view history of their assigned subordinates.
   * - EMPLOYEE: can only view their own history.
   */
  async getEmployeeAttendance(
    employeeId: string,
    currentUser?: { userId: string; role: Role }
  ) {
    if (currentUser && currentUser.role === Role.MANAGER) {
      const managerEmployee = await employeeRepository.findByUserId(
        currentUser.userId
      );
      const targetEmployee = await employeeRepository.findById(employeeId);
      if (
        !managerEmployee ||
        !targetEmployee ||
        (targetEmployee.managerId !== managerEmployee.id &&
          targetEmployee.userId !== currentUser.userId)
      ) {
        throw new ForbiddenError(
          "You can only view attendance of employees assigned to you."
        );
      }
    } else if (currentUser && currentUser.role === Role.EMPLOYEE) {
      // Employees can only view their own attendance via their employeeId
      const ownEmployee = await employeeRepository.findByUserId(
        currentUser.userId
      );
      if (!ownEmployee || ownEmployee.id !== employeeId) {
        throw new ForbiddenError(
          "You can only view your own attendance."
        );
      }
    }

    return attendanceRepository.findEmployeeAttendance(employeeId);
  }

  /**
   * Attendance By ID
   */
  async getAttendanceById(id: string) {
    const attendance =
      await attendanceRepository.findById(id);

    if (!attendance) {
      throw new NotFoundError(
        "Attendance not found"
      );
    }

    return attendance;
  }
}

export const attendanceService =
  new AttendanceService();