import rateLimit from 'express-rate-limit';
import { env } from '../config/env';
import { sendError } from '../utils/response.util';
import { HttpStatus } from '../constants/statusCodes';
import { Messages } from '../constants/messages';

/**
 * Strict rate limiter for authentication endpoints (login, register, password reset).
 * Prevents brute force and credential stuffing attacks.
 */
export const authRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    sendError(
      res,
      Messages.SYSTEM.RATE_LIMIT_EXCEEDED,
      [],
      HttpStatus.TOO_MANY_REQUESTS
    );
  }
});

/**
 * General API rate limiter for all non-auth endpoints.
 * More permissive than the auth limiter.
 */
export const generalRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX * 5, // 5x the auth limit
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    sendError(
      res,
      Messages.SYSTEM.RATE_LIMIT_EXCEEDED,
      [],
      HttpStatus.TOO_MANY_REQUESTS
    );
  }
});
