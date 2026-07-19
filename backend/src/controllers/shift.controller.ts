import { Request, Response, NextFunction } from "express";

import { shiftService } from "../services/shift.service";

import { sendSuccess } from "../utils/response.util";

import { HttpStatus } from "../constants/statusCodes";

import { Messages } from "../constants/messages";

export class ShiftController {
  /**
   * Create Shift
   */
  createShift = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const shift = await shiftService.createShift(req.body);

      sendSuccess(
        res,
        { shift },
        Messages.SHIFT.CREATED,
        HttpStatus.CREATED
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get All Shifts
   */
  getAllShifts = async (
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const shifts = await shiftService.getAllShifts();

      sendSuccess(
        res,
        { shifts },
        Messages.SHIFT.LIST_SUCCESS,
        HttpStatus.OK
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get Shift By ID
   */
  getShiftById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const shift = await shiftService.getShiftById(req.params.id);

      sendSuccess(
        res,
        { shift },
        Messages.SHIFT.DETAIL_SUCCESS,
        HttpStatus.OK
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update Shift
   */
  updateShift = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const shift = await shiftService.updateShift(
        req.params.id,
        req.body
      );

      sendSuccess(
        res,
        { shift },
        Messages.SHIFT.UPDATED,
        HttpStatus.OK
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete Shift
   */
  deleteShift = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      await shiftService.deleteShift(req.params.id);

      sendSuccess(
        res,
        null,
        Messages.SHIFT.DELETED,
        HttpStatus.OK
      );
    } catch (error) {
      next(error);
    }
  };
}

export const shiftController = new ShiftController();