import { Request, Response, NextFunction } from "express";

import { dashboardService } from "../services/dashboard.service";

import { sendSuccess } from "../utils/response.util";

import { HttpStatus } from "../constants/statusCodes";

export class DashboardController {
  getDashboard = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const dashboard =
        await dashboardService.getDashboard(req.user);

      sendSuccess(
        res,
        { dashboard },
        "Dashboard retrieved successfully",
        HttpStatus.OK
      );
    } catch (error) {
      next(error);
    }
  };
}

export const dashboardController =
  new DashboardController();