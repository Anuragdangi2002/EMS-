import { CookieOptions } from 'express';
import { env } from '../config/env';

export const CookieNames = {
  REFRESH_TOKEN: 'refreshToken'
} as const;

export const getCookieOptions = (maxAgeMs: number): CookieOptions => {
  return {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: maxAgeMs,
    path: '/'
  };
};
