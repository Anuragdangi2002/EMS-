import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/error.util';
import { handlePrismaError } from '../utils/prisma-error.util';
import { sendError } from '../utils/response.util';
import { env } from '../config/env';
import { logger } from '../utils/logger.util';
import { Messages } from '../constants/messages';
import { HttpStatus } from '../constants/statusCodes';
import jwt from 'jsonwebtoken';

/**
 * Global Express Error Handling Middleware.
 */
export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let error = err;

  // Log full stack details using Winston logger
  logger.error(err.stack || err.message || err);

  // Translate database/Prisma errors
  error = handlePrismaError(error);

  // Translate JWT encoding/decoding errors
  if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
    error = new AppError(Messages.AUTH.UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
  }

  // Handle expected operational errors
  if (error instanceof AppError) {
    return sendError(res, error.message, error.errors, error.statusCode);
  }

  // Handle JSON parsing syntax errors (e.g. malformed body payloads)
  if (err.type === 'entity.parse.failed') {
    return sendError(res, 'Malformed JSON payload provided', [], HttpStatus.BAD_REQUEST);
  }

  // Fallback for unhandled programming exceptions
  const message = env.NODE_ENV === 'production'
    ? Messages.SYSTEM.SERVER_ERROR
    : err.message || Messages.SYSTEM.SERVER_ERROR;

  return sendError(
    res,
    message,
    [],
    HttpStatus.INTERNAL_SERVER_ERROR
  );
};
