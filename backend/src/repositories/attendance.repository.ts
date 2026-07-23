import { Attendance, Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";

export class AttendanceRepository {
  async create(data: Prisma.AttendanceCreateInput): Promise<Attendance> {
    return prisma.attendance.create({
      data,
    });
  }

  async update(
    id: string,
    data: Prisma.AttendanceUpdateInput
  ): Promise<Attendance> {
    return prisma.attendance.update({
      where: { id },
      data,
    });
  }

  async findById(id: string): Promise<Attendance | null> {
    return prisma.attendance.findUnique({
      where: { id },
    });
  }

  async findTodayAttendance(employeeId: string, date: Date) {
    return prisma.attendance.findFirst({
      where: {
        employeeId,
        date,
      },
      include: {
        logs: {
          orderBy: {
            timestamp: "asc",
          },
        },
      },
    });
  }

  async getEmployeeWithShift(employeeId: string) {
    return prisma.employee.findUnique({
      where: {
        id: employeeId,
      },
      include: {
        shift: true,
      },
    });
  }

  async findAll() {
    return prisma.attendance.findMany({
      include: {
        employee: true,
        logs: {
          orderBy: {
            timestamp: "asc",
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });
  }

  async findEmployeeAttendance(employeeId: string) {
    return prisma.attendance.findMany({
      where: {
        employeeId,
      },
      include: {
        logs: {
          orderBy: {
            timestamp: "asc",
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });
  }
}

export const attendanceRepository =
  new AttendanceRepository();