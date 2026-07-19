import { Prisma, Role } from "@prisma/client";
import { prisma } from "../config/prisma";
import { EmployeeRepository } from "../repositories/employee.repository";
import {
  ConflictError,
  NotFoundError,
  ForbiddenError,
} from "../utils/error.util";
import { Messages } from "../constants/messages";

const employeeRepository = new EmployeeRepository();

export class EmployeeService {
  /**
   * Create a new employee.
   */
  async createEmployee(data: any) {
    // Check duplicate employee code
    const existingCode =
      await employeeRepository.findByEmployeeCode(
        data.employeeCode
      );

    if (existingCode) {
      throw new ConflictError(
        Messages.EMPLOYEE.EMPLOYEE_CODE_EXISTS
      );
    }

    // Check whether the user already has an employee profile
    const existingEmployee =
      await employeeRepository.findByUserId(data.userId);

    if (existingEmployee) {
      throw new ConflictError(
        Messages.EMPLOYEE.USER_ALREADY_LINKED
      );
    }

    // Check whether the user exists
    const user = await prisma.user.findUnique({
      where: {
        id: data.userId,
      },
    });

    if (!user) {
      throw new NotFoundError(
        Messages.EMPLOYEE.USER_NOT_FOUND
      );
    }

    // Convert request body into Prisma format
    const employeeData: Prisma.EmployeeCreateInput = {
      employeeCode: data.employeeCode,

      user: {
        connect: {
          id: data.userId,
        },
      },

      firstName: data.firstName,

      lastName: data.lastName,

      dateOfBirth: new Date(data.dateOfBirth),

      gender: data.gender,

      joiningDate: new Date(data.joiningDate),

      employmentType: data.employmentType,

      designation: data.designation,

      department: {
        connect: {
          id: data.department,
        },
      },

      shift: data.shift
        ? {
            connect: {
              id: data.shift,
            },
          }
        : undefined,

      address: data.address,

      city: data.city,

      state: data.state,

      country: data.country,

      postalCode: data.postalCode,

      profileImageUrl: data.profileImageUrl,

      salary: data.salary ? parseFloat(data.salary) : null,

      workFromHome: data.workFromHome ?? false,

      shortLeaves: data.shortLeaves ? parseInt(data.shortLeaves) : 0,

      manager: data.managerId
        ? {
            connect: {
              id: data.managerId,
            },
          }
        : undefined,
    };

    return employeeRepository.create(employeeData);
  }

  /**
   * Get all active employees.
   */
  async getAllEmployees(currentUser?: { userId: string; role: Role }) {
    if (currentUser && currentUser.role === Role.MANAGER) {
      const managerEmployee = await employeeRepository.findByUserId(
        currentUser.userId
      );
      if (!managerEmployee) {
        return [];
      }
      return prisma.employee.findMany({
        where: {
          isActive: true,
          managerId: managerEmployee.id,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }
    return employeeRepository.findAll();
  }

  /**
   * Get employee by ID.
   */
  async getEmployeeById(id: string, currentUser?: { userId: string; role: Role }) {
    const employee =
      await employeeRepository.findById(id);

    if (!employee || !employee.isActive) {
      throw new NotFoundError(
        Messages.EMPLOYEE.NOT_FOUND
      );
    }

    if (currentUser && currentUser.role === Role.MANAGER) {
      const managerEmployee = await employeeRepository.findByUserId(
        currentUser.userId
      );
      if (!managerEmployee || (employee.managerId !== managerEmployee.id && employee.userId !== currentUser.userId)) {
        throw new ForbiddenError(Messages.AUTH.FORBIDDEN);
      }
    }

    return employee;
  }

  /**
   * Update employee.
   */
  async updateEmployee(
    id: string,
    data: any,
    currentUser?: { userId: string; role: Role }
  ) {
    const employee =
      await this.getEmployeeById(id, currentUser);

    if (
      data.employeeCode &&
      typeof data.employeeCode === "string"
    ) {
      const existingEmployee =
        await employeeRepository.findByEmployeeCode(
          data.employeeCode
        );

      if (
        existingEmployee &&
        existingEmployee.id !== employee.id
      ) {
        throw new ConflictError(
          Messages.EMPLOYEE.EMPLOYEE_CODE_EXISTS
        );
      }
    }

    const updateData: Prisma.EmployeeUpdateInput = {
      firstName: data.firstName,
      lastName: data.lastName,
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
      gender: data.gender,
      joiningDate: data.joiningDate ? new Date(data.joiningDate) : undefined,
      employmentType: data.employmentType,
      designation: data.designation,
      address: data.address,
      city: data.city,
      state: data.state,
      country: data.country,
      postalCode: data.postalCode,
      profileImageUrl: data.profileImageUrl,
      salary: data.salary !== undefined ? (data.salary ? parseFloat(data.salary) : null) : undefined,
      workFromHome: data.workFromHome,
      shortLeaves: data.shortLeaves !== undefined ? parseInt(data.shortLeaves) : undefined,
    };

    if (data.department) {
      updateData.department = {
        connect: {
          id: data.department,
        },
      };
    }

    if (data.shift !== undefined) {
      updateData.shift = data.shift
        ? {
            connect: {
              id: data.shift,
            },
          }
        : {
            disconnect: true,
          };
    }

    if (data.managerId !== undefined) {
      if (currentUser && currentUser.role !== Role.DIRECTOR && currentUser.role !== Role.HR) {
        // Prevent manager/employee from changing their own manager
      } else {
        updateData.manager = data.managerId
          ? {
              connect: {
                id: data.managerId,
              },
            }
          : {
              disconnect: true,
            };
      }
    }

    return employeeRepository.update(id, updateData);
  }

  /**
   * Soft delete employee.
   */
  async deleteEmployee(id: string) {
    await this.getEmployeeById(id);

    return employeeRepository.softDelete(id);
  }

  /**
   * Get employee by user ID.
   */
  async getEmployeeByUserId(userId: string) {
    const employee =
      await employeeRepository.findByUserId(userId);

    if (!employee || !employee.isActive) {
      throw new NotFoundError(
        Messages.EMPLOYEE.NOT_FOUND
      );
    }

    return employee;
  }
}

export const employeeService = new EmployeeService();