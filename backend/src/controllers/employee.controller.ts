import { Request, Response, NextFunction } from "express";

import { employeeService } from "../services/employee.service";

import { sendSuccess } from "../utils/response.util";

import { HttpStatus } from "../constants/statusCodes";

import { Messages } from "../constants/messages";

import { UnauthorizedError } from "../utils/error.util";


export class EmployeeController {

    /**
 * Create a new employee.
 */
createEmployee = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const employee = await employeeService.createEmployee(req.body);

    sendSuccess(
      res,
      { employee },
      Messages.EMPLOYEE.CREATED,
      HttpStatus.CREATED
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get all employees.
 */
getAllEmployees = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const employees = await employeeService.getAllEmployees(req.user);

    sendSuccess(
      res,
      { employees },
      Messages.EMPLOYEE.LIST_SUCCESS,
      HttpStatus.OK
    );
  } catch (error) {
    next(error);
  }
};


/**
 * Get employee by ID.
 */
getEmployeeById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const employee = await employeeService.getEmployeeById(
      req.params.id,
      req.user
    );
      
    sendSuccess(
      res,
      { employee },
      Messages.EMPLOYEE.DETAIL_SUCCESS,
      HttpStatus.OK
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Update employee.
 */
updateEmployee = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const employee = await employeeService.updateEmployee(
      req.params.id,
      req.body,
      req.user
    );

    sendSuccess(
      res,
      { employee },
      Messages.EMPLOYEE.UPDATED,
      HttpStatus.OK
    );
  } catch (error) {
    next(error);
  }
};


/**
 * Soft delete employee.
 */
deleteEmployee = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await employeeService.deleteEmployee(req.params.id);

    sendSuccess(
      res,
      null,
      Messages.EMPLOYEE.DELETED,
      HttpStatus.OK
    );
  } catch (error) {
    next(error);
  }
};


/**
 * Get current logged-in employee profile.
 */
getCurrentEmployee = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      throw new UnauthorizedError(
        Messages.AUTH.UNAUTHORIZED
      );
    }

    const employee =
      await employeeService.getEmployeeByUserId(userId);

    sendSuccess(
      res,
      { employee },
      Messages.EMPLOYEE.DETAIL_SUCCESS,
      HttpStatus.OK
    );
  } catch (error) {
    next(error);
  }
};

}

export const employeeController = new EmployeeController();
