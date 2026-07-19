import jwt from 'jsonwebtoken';
import { jwtConfig } from '../../config/jwt';
import { Role } from '@prisma/client';

export interface TokenPayload {
  userId: string;
  role: Role;
  version?: number; // Version count included in refresh tokens for revocation
}

/**
 * Signs a short-lived access JWT containing user credentials.
 */
export const signAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(
    { userId: payload.userId, role: payload.role },
    jwtConfig.accessSecret,
    { expiresIn: jwtConfig.accessExpiresIn as jwt.SignOptions['expiresIn'] }
  );
};

/**
 * Signs a long-lived refresh JWT containing the current token version.
 */
export const signRefreshToken = (payload: Required<TokenPayload>): string => {
  return jwt.sign(
    { userId: payload.userId, role: payload.role, version: payload.version },
    jwtConfig.refreshSecret,
    { expiresIn: jwtConfig.refreshExpiresIn as jwt.SignOptions['expiresIn'] }
  );
};

/**
 * Verifies and decodes an access token.
 */
export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, jwtConfig.accessSecret) as TokenPayload;
};

/**
 * Verifies and decodes a refresh token.
 */
export const verifyRefreshToken = (token: string): Required<TokenPayload> => {
  return jwt.verify(token, jwtConfig.refreshSecret) as Required<TokenPayload>;
};
