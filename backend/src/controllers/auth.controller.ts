import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { sendSuccess } from '../utils/response.util';
import { setRefreshTokenCookie, clearRefreshTokenCookie } from '../utils/cookie.util';
import { HttpStatus } from '../constants/statusCodes';
import { Messages } from '../constants/messages';
import { UnauthorizedError } from '../utils/error.util';

// 7 days in milliseconds: matches the default JWT refresh token expiration
const REFRESH_TOKEN_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export class AuthController {
  /**
   * Registers a new user and returns access credentials.
   */
  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { user, accessToken, refreshToken } = await authService.register(req.body);
      
      // Set long-lived secure cookie
      setRefreshTokenCookie(res, refreshToken, REFRESH_TOKEN_MAX_AGE_MS);

      sendSuccess(
        res,
        { user, accessToken },
        Messages.AUTH.REGISTER_SUCCESS,
        HttpStatus.CREATED
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Validates credentials and returns credentials.
   */
  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { user, accessToken, refreshToken } = await authService.login(req.body);

      // Set long-lived secure cookie
      setRefreshTokenCookie(res, refreshToken, REFRESH_TOKEN_MAX_AGE_MS);

      sendSuccess(
        res,
        { user, accessToken },
        Messages.AUTH.LOGIN_SUCCESS,
        HttpStatus.OK
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Revokes active session and clears client cookies.
   */
  logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (userId) {
        await authService.logout(userId);
      }

      // Clear cookie client-side
      clearRefreshTokenCookie(res);

      sendSuccess(res, null, Messages.AUTH.LOGOUT_SUCCESS, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Processes token refresh requests, rotating the tokens.
   */
  refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Read refresh token from signed cookie or fallback request body
      const token = req.cookies?.refreshToken || req.body?.refreshToken;
      if (!token) {
        throw new UnauthorizedError(Messages.AUTH.INVALID_REFRESH_TOKEN);
      }

      const { accessToken, refreshToken } = await authService.refresh(token);

      // Set rotated refresh cookie
      setRefreshTokenCookie(res, refreshToken, REFRESH_TOKEN_MAX_AGE_MS);

      sendSuccess(
        res,
        { accessToken },
        Messages.AUTH.TOKEN_REFRESH_SUCCESS,
        HttpStatus.OK
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Requests a password reset link/token.
   */
  forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email } = req.body;
      await authService.forgotPassword(email);

      sendSuccess(
        res,
        null,
        Messages.AUTH.PASSWORD_RESET_REQUEST_SUCCESS,
        HttpStatus.OK
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Resets password using valid reset token.
   */
  resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { token, password } = req.body;
      await authService.resetPassword(token, password);

      sendSuccess(
        res,
        null,
        Messages.AUTH.PASSWORD_RESET_SUCCESS,
        HttpStatus.OK
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Retrieves active profile details for the authenticated user.
   */
  getCurrentUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new UnauthorizedError(Messages.AUTH.UNAUTHORIZED);
      }

      const user = await authService.getCurrentUser(userId);

      sendSuccess(res, { user }, 'User profile retrieved', HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };
}

export const authController = new AuthController();
