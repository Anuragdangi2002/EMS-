import { Request, Response, NextFunction } from "express";

import { LeaveStatus } from "@prisma/client";

import { leaveService } from "../services/leave.service";

import { sendSuccess } from "../utils/response.util";

import { HttpStatus } from "../constants/statusCodes";

import { Messages } from "../constants/messages";

export class LeaveController {
  /**
   * Apply Leave
   */
  applyLeave = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const leave = await leaveService.applyLeave({
        employee: {
          connect: {
            id: req.body.employeeId,
          },
        },
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        reason: req.body.reason,
      });

      sendSuccess(
        res,
        { leave },
        Messages.LEAVE.APPLIED,
        HttpStatus.CREATED
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get All Leaves
   */
  getAllLeaves = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const leaves =
        await leaveService.getAllLeaves(req.user);

      sendSuccess(
        res,
        { leaves },
        Messages.LEAVE.LIST_SUCCESS,
        HttpStatus.OK
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Approve / Reject Leave
   */
  updateLeaveStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const leave =
        await leaveService.updateLeaveStatus(
          req.params.id,
          req.body.status as LeaveStatus,
          req.user
        );

      sendSuccess(
        res,
        { leave },
        Messages.LEAVE.UPDATED,
        HttpStatus.OK
      );
    } catch (error) {
      next(error);
    }
  };
}

export const leaveController =
  new LeaveController();