import { Response } from 'express';
import { CookieNames, getCookieOptions } from '../constants/cookies';

/**
 * Sets the Refresh Token HttpOnly Cookie on the response.
 */
export const setRefreshTokenCookie = (res: Response, token: string, maxAgeMs: number): void => {
  res.cookie(CookieNames.REFRESH_TOKEN, token, getCookieOptions(maxAgeMs));
};

/**
 * Clears the Refresh Token HttpOnly Cookie from the response.
 */
export const clearRefreshTokenCookie = (res: Response): void => {
  res.clearCookie(CookieNames.REFRESH_TOKEN, getCookieOptions(0));
};
