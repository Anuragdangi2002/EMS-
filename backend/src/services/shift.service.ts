import { Prisma } from "@prisma/client";

import { shiftRepository } from "../repositories/shift.repository";

import {
  ConflictError,
  NotFoundError,
} from "../utils/error.util";

import { Messages } from "../constants/messages";

export class ShiftService {
  /**
   * Create Shift
   */
  async createShift(data: Prisma.ShiftCreateInput) {
    const existing =
      await shiftRepository.findByName(data.name);

    if (existing) {
      throw new ConflictError(
        Messages.SHIFT.NAME_EXISTS
      );
    }

    return shiftRepository.create(data);
  }

  /**
   * Get All Shifts
   */
  async getAllShifts() {
    return shiftRepository.findAll();
  }

  /**
   * Get Shift By ID
   */
  async getShiftById(id: string) {
    const shift = await shiftRepository.findById(id);

    if (!shift || !shift.isActive) {
      throw new NotFoundError(
        Messages.SHIFT.NOT_FOUND
      );
    }

    return shift;
  }

  /**
   * Update Shift
   */
  async updateShift(
    id: string,
    data: Prisma.ShiftUpdateInput
  ) {
    await this.getShiftById(id);

    if (data.name && typeof data.name === "string") {
      const existing =
        await shiftRepository.findByName(data.name);

      if (existing && existing.id !== id) {
        throw new ConflictError(
          Messages.SHIFT.NAME_EXISTS
        );
      }
    }

    return shiftRepository.update(id, data);
  }

  /**
   * Delete Shift
   */
  async deleteShift(id: string) {
    await this.getShiftById(id);

    return shiftRepository.softDelete(id);
  }
}

export const shiftService = new ShiftService();