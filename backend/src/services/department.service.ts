import { Prisma } from "@prisma/client";

import { departmentRepository } from "../repositories/department.repository";

import {
  ConflictError,
  NotFoundError,
} from "../utils/error.util";

import { Messages } from "../constants/messages";

export class DepartmentService {
  /**
   * Create Department
   */
  async createDepartment(
    data: Prisma.DepartmentCreateInput
  ) {
    const existingName =
      await departmentRepository.findByName(data.name);

    if (existingName) {
      throw new ConflictError(
        Messages.DEPARTMENT.NAME_EXISTS
      );
    }

    const existingCode =
      await departmentRepository.findByCode(data.code);

    if (existingCode) {
      throw new ConflictError(
        Messages.DEPARTMENT.CODE_EXISTS
      );
    }

    return departmentRepository.create(data);
  }

  /**
   * Get All Departments
   */
  async getAllDepartments() {
    return departmentRepository.findAll();
  }

  /**
   * Get Department By ID
   */
  async getDepartmentById(id: string) {
    const department =
      await departmentRepository.findById(id);

    if (!department || !department.isActive) {
      throw new NotFoundError(
        Messages.DEPARTMENT.NOT_FOUND
      );
    }

    return department;
  }

  /**
   * Update Department
   */
  async updateDepartment(
    id: string,
    data: Prisma.DepartmentUpdateInput
  ) {
    await this.getDepartmentById(id);

    if (data.name && typeof data.name === "string") {
      const existing =
        await departmentRepository.findByName(data.name);

      if (existing && existing.id !== id) {
        throw new ConflictError(
          Messages.DEPARTMENT.NAME_EXISTS
        );
      }
    }

    if (data.code && typeof data.code === "string") {
      const existing =
        await departmentRepository.findByCode(data.code);

      if (existing && existing.id !== id) {
        throw new ConflictError(
          Messages.DEPARTMENT.CODE_EXISTS
        );
      }
    }

    return departmentRepository.update(id, data);
  }

  /**
   * Delete Department
   */
  async deleteDepartment(id: string) {
    await this.getDepartmentById(id);

    return departmentRepository.softDelete(id);
  }
}

export const departmentService =
  new DepartmentService();