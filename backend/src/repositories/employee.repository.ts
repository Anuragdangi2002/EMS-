import { Prisma, Employee } from '@prisma/client';
import { prisma } from '../config/prisma';

export class EmployeeRepository {
  /**
   * Create a new employee.
   */
  async create(data: Prisma.EmployeeCreateInput): Promise<Employee> {
    return prisma.employee.create({
      data,
    });
  }

  /**
   * Get all active employees.
   */
  async findAll(): Promise<any[]> {
    return prisma.employee.findMany({
      where: {
        isActive: true,
      },
      include: {
        user: {
          select: {
            email: true,
            phone: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Find employee by ID.
   */
  async findById(id: string): Promise<any | null> {
    return prisma.employee.findUnique({
      where: {
        id,
      },
      include: {
        user: {
          select: {
            email: true,
            phone: true,
          },
        },
      },
    });
  }

  /**
   * Find employee by Employee Code.
   */
  async findByEmployeeCode(employeeCode: string): Promise<any | null> {
    return prisma.employee.findUnique({
      where: {
        employeeCode,
      },
      include: {
        user: {
          select: {
            email: true,
            phone: true,
          },
        },
      },
    });
  }

  /**
   * Find employee by User ID.
   */
  async findByUserId(userId: string): Promise<any | null> {
    return prisma.employee.findUnique({
      where: {
        userId,
      },
      include: {
        user: {
          select: {
            email: true,
            phone: true,
          },
        },
      },
    });
  }

  /**
   * Update employee.
   */
  async update(
    id: string,
    data: Prisma.EmployeeUpdateInput
  ): Promise<Employee> {
    return prisma.employee.update({
      where: {
        id,
      },
      data,
    });
  }

  /**
   * Soft delete employee.
   */
  async softDelete(id: string): Promise<Employee> {
    return prisma.employee.update({
      where: {
        id,
      },
      data: {
        isActive: false,
      },
    });
  }
}

export const employeeRepository = new EmployeeRepository();