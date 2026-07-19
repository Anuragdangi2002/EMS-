import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/auth/jwt.util";
import { UnauthorizedError } from "../utils/error.util";
import { Messages } from "../constants/messages";
import { prisma } from "../config/prisma";

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(new UnauthorizedError(Messages.AUTH.UNAUTHORIZED));
    }

    const token = authHeader.split(" ")[1];

    const decoded = verifyAccessToken(token);

    const employee = await prisma.employee.findUnique({
      where: {
        userId: decoded.userId,
      },
      select: {
        id: true,
      },
    });

    req.user = {
      userId: decoded.userId,
      role: decoded.role,
      employeeId: employee?.id,
    };

    next();
  } catch (error) {
    console.error(error);
    next(new UnauthorizedError(Messages.AUTH.UNAUTHORIZED));
  }
};