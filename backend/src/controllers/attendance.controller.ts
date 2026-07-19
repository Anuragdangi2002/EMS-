import { Request, Response, NextFunction } from "express";

import { attendanceService } from "../services/attendance.service";

import { sendSuccess } from "../utils/response.util";

import { HttpStatus } from "../constants/statusCodes";

export class AttendanceController {
  /**
   * Employee Check In
   */
  checkIn = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const attendance =
        await attendanceService.checkIn(req.body.employeeId);

      sendSuccess(
        res,
        { attendance },
        "Checked in successfully.",
        HttpStatus.CREATED
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Employee Check Out
   */
  checkOut = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const attendance =
        await attendanceService.checkOut(req.body.employeeId);

      sendSuccess(
        res,
        { attendance },
        "Checked out successfully.",
        HttpStatus.OK
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get Attendance List
   */
  getAttendanceList = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const attendance =
        await attendanceService.getAttendanceList(req.user);

      sendSuccess(
        res,
        { attendance },
        "Attendance fetched successfully.",
        HttpStatus.OK
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get Employee Attendance
   */
  getEmployeeAttendance = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const attendance =
        await attendanceService.getEmployeeAttendance(
          req.params.employeeId,
          req.user
        );

      sendSuccess(
        res,
        { attendance },
        "Attendance fetched successfully.",
        HttpStatus.OK
      );
    } catch (error) {
      next(error);
    }
  };
}

export const attendanceController =
  new AttendanceController();