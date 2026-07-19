import { Request, Response, NextFunction } from "express";

import { departmentService } from "../services/department.service";

import { sendSuccess } from "../utils/response.util";

import { HttpStatus } from "../constants/statusCodes";

import { Messages } from "../constants/messages";

export class DepartmentController {
  /**
   * Create Department
   */
  createDepartment = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const department =
        await departmentService.createDepartment(req.body);

      sendSuccess(
        res,
        { department },
        Messages.DEPARTMENT.CREATED,
        HttpStatus.CREATED
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get All Departments
   */
  getAllDepartments = async (
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const departments =
        await departmentService.getAllDepartments();

      sendSuccess(
        res,
        { departments },
        Messages.DEPARTMENT.LIST_SUCCESS,
        HttpStatus.OK
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get Department By ID
   */
  getDepartmentById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const department =
        await departmentService.getDepartmentById(req.params.id);

      sendSuccess(
        res,
        { department },
        Messages.DEPARTMENT.DETAIL_SUCCESS,
        HttpStatus.OK
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update Department
   */
  updateDepartment = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const department =
        await departmentService.updateDepartment(
          req.params.id,
          req.body
        );

      sendSuccess(
        res,
        { department },
        Messages.DEPARTMENT.UPDATED,
        HttpStatus.OK
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete Department
   */
  deleteDepartment = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      await departmentService.deleteDepartment(req.params.id);

      sendSuccess(
        res,
        null,
        Messages.DEPARTMENT.DELETED,
        HttpStatus.OK
      );
    } catch (error) {
      next(error);
    }
  };
}

export const departmentController = new DepartmentController();