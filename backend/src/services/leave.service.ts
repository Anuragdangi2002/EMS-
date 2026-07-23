import { LeaveStatus, Prisma, Role } from "@prisma/client";

import { leaveRepository } from "../repositories/leave.repository";

import { employeeRepository } from "../repositories/employee.repository";

import {
  NotFoundError,
  ForbiddenError,
} from "../utils/error.util";

import { Messages } from "../constants/messages";

export class LeaveService {
  /**
   * Apply Leave
   */
  async applyLeave(data: Prisma.LeaveCreateInput) {
    const employee = await employeeRepository.findById(
      data.employee.connect?.id as string
    );

    if (!employee) {
      throw new NotFoundError(
        Messages.EMPLOYEE.NOT_FOUND
      );
    }

    return leaveRepository.create(data);
  }

  async getAllLeaves(currentUser?: { userId: string; role: Role }) {
    if (currentUser && currentUser.role === Role.EMPLOYEE) {
      const employee = await employeeRepository.findByUserId(
        currentUser.userId
      );
      if (!employee) {
        return [];
      }
      const { prisma } = await import("../config/prisma");
      return prisma.leave.findMany({
        where: {
          employeeId: employee.id,
        },
        include: {
          employee: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }
    if (currentUser && currentUser.role === Role.MANAGER) {
      const managerEmployee = await employeeRepository.findByUserId(
        currentUser.userId
      );
      if (!managerEmployee) {
        return [];
      }
      const { prisma } = await import("../config/prisma");
      return prisma.leave.findMany({
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
          createdAt: "desc",
        },
      });
    }
    return leaveRepository.findAll();
  }

  /**
   * Approve / Reject Leave.
   * - DIRECTOR / HR: can approve/reject any leave.
   * - MANAGER: can only approve/reject leaves of their assigned subordinates.
   */
  async updateLeaveStatus(
    id: string,
    status: LeaveStatus,
    currentUser?: { userId: string; role: Role }
  ) {
    const leave = await leaveRepository.findById(id);

    if (!leave) {
      throw new NotFoundError(
        Messages.LEAVE.NOT_FOUND
      );
    }

    if (currentUser && currentUser.role === Role.MANAGER) {
      const managerEmployee = await employeeRepository.findByUserId(
        currentUser.userId
      );
      const targetEmployee = await employeeRepository.findById(
        leave.employeeId
      );
      if (
        !managerEmployee ||
        !targetEmployee ||
        targetEmployee.managerId !== managerEmployee.id
      ) {
        throw new ForbiddenError(
          "You can only manage leaves of employees assigned to you."
        );
      }
    }

    const oldStatus = leave.status;
    const updatedLeave = await leaveRepository.updateStatus(id, status);

    if (oldStatus !== LeaveStatus.APPROVED && status === LeaveStatus.APPROVED) {
      // Deduct leaves
      const days = Math.ceil(Math.abs(leave.endDate.getTime() - leave.startDate.getTime()) / (1000 * 3600 * 24)) + 1;
      const { prisma } = await import("../config/prisma");
      await prisma.employee.update({
        where: { id: leave.employeeId },
        data: { leaveBalance: { decrement: days } }
      });
    } else if (oldStatus === LeaveStatus.APPROVED && status !== LeaveStatus.APPROVED) {
      // Refund leaves
      const days = Math.ceil(Math.abs(leave.endDate.getTime() - leave.startDate.getTime()) / (1000 * 3600 * 24)) + 1;
      const { prisma } = await import("../config/prisma");
      await prisma.employee.update({
        where: { id: leave.employeeId },
        data: { leaveBalance: { increment: days } }
      });
    }

    return updatedLeave;
  }
}

export const leaveService = new LeaveService();