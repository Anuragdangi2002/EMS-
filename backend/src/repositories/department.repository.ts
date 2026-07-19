import { Department, Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";

export class DepartmentRepository {
  async create(
    data: Prisma.DepartmentCreateInput
  ): Promise<Department> {
    return prisma.department.create({
      data,
    });
  }

  async findAll(): Promise<Department[]> {
    return prisma.department.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findById(
    id: string
  ): Promise<Department | null> {
    return prisma.department.findUnique({
      where: {
        id,
      },
    });
  }

  async findByName(
    name: string
  ): Promise<Department | null> {
    return prisma.department.findUnique({
      where: {
        name,
      },
    });
  }

  async findByCode(
    code: string
  ): Promise<Department | null> {
    return prisma.department.findUnique({
      where: {
        code,
      },
    });
  }

  async update(
    id: string,
    data: Prisma.DepartmentUpdateInput
  ): Promise<Department> {
    return prisma.department.update({
      where: {
        id,
      },
      data,
    });
  }

  async softDelete(
    id: string
  ): Promise<Department> {
    return prisma.department.update({
      where: {
        id,
      },
      data: {
        isActive: false,
      },
    });
  }
}

export const departmentRepository =
  new DepartmentRepository();