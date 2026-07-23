import { Prisma, Holiday } from "@prisma/client";
import { prisma } from "../config/prisma";

export class HolidayRepository {
  async create(data: Prisma.HolidayCreateInput): Promise<Holiday> {
    return prisma.holiday.create({
      data,
    });
  }

  async findAll(): Promise<Holiday[]> {
    return prisma.holiday.findMany({
      orderBy: {
        date: "asc",
      },
    });
  }

  async findById(id: string): Promise<Holiday | null> {
    return prisma.holiday.findUnique({
      where: {
        id,
      },
    });
  }

  async update(id: string, data: Prisma.HolidayUpdateInput): Promise<Holiday> {
    return prisma.holiday.update({
      where: {
        id,
      },
      data,
    });
  }

  async delete(id: string): Promise<Holiday> {
    return prisma.holiday.delete({
      where: {
        id,
      },
    });
  }
}

export const holidayRepository = new HolidayRepository();
