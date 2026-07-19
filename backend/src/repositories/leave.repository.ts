import {
  Prisma,
  Leave,
  LeaveStatus,
} from "@prisma/client";

import { prisma } from "../config/prisma";

export class LeaveRepository {
  async create(
    data: Prisma.LeaveCreateInput
  ): Promise<Leave> {
    return prisma.leave.create({
      data,
    });
  }

  async findAll(): Promise<Leave[]> {
    return prisma.leave.findMany({
      include: {
        employee: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findById(
    id: string
  ): Promise<Leave | null> {
    return prisma.leave.findUnique({
      where: {
        id,
      },
    });
  }

  async updateStatus(
    id: string,
    status: LeaveStatus
  ): Promise<Leave> {
    return prisma.leave.update({
      where: {
        id,
      },
      data: {
        status,
      },
    });
  }
}

export const leaveRepository =
  new LeaveRepository();