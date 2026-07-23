import { Request, Response, NextFunction } from "express";
import { holidayService } from "../services/holiday.service";
import { sendSuccess } from "../utils/response.util";
import { HttpStatus } from "../constants/statusCodes";
import { Messages } from "../constants/messages";

export class HolidayController {
  createHoliday = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const holiday = await holidayService.createHoliday(req.body);
      sendSuccess(
        res,
        { holiday },
        Messages.HOLIDAY.CREATED,
        HttpStatus.CREATED
      );
    } catch (error) {
      next(error);
    }
  };

  getAllHolidays = async (
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const holidays = await holidayService.getAllHolidays();
      sendSuccess(
        res,
        { holidays },
        Messages.HOLIDAY.LIST_SUCCESS,
        HttpStatus.OK
      );
    } catch (error) {
      next(error);
    }
  };

  getHolidayById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const holiday = await holidayService.getHolidayById(req.params.id);
      sendSuccess(
        res,
        { holiday },
        Messages.HOLIDAY.DETAIL_SUCCESS,
        HttpStatus.OK
      );
    } catch (error) {
      next(error);
    }
  };

  updateHoliday = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const holiday = await holidayService.updateHoliday(req.params.id, req.body);
      sendSuccess(
        res,
        { holiday },
        Messages.HOLIDAY.UPDATED,
        HttpStatus.OK
      );
    } catch (error) {
      next(error);
    }
  };

  deleteHoliday = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      await holidayService.deleteHoliday(req.params.id);
      sendSuccess(
        res,
        null,
        Messages.HOLIDAY.DELETED,
        HttpStatus.OK
      );
    } catch (error) {
      next(error);
    }
  };
}

export const holidayController = new HolidayController();
