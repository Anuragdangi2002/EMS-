import { Request, Response, NextFunction } from "express";
import { Role } from "@prisma/client";

import {
  ForbiddenError,
  UnauthorizedError,
} from "../utils/error.util";

import { Messages } from "../constants/messages";

/**
 * Role-based authorization middleware.
 */
export const authorize = (...allowedRoles: Role[]) => {
  return (
    req: Request,
    _res: Response,
    next: NextFunction
  ): void => {
    if (!req.user) {
      return next(
        new UnauthorizedError(Messages.AUTH.UNAUTHORIZED)
      );
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ForbiddenError(Messages.AUTH.FORBIDDEN)
      );
    }

    next();
  };
};