import { Role } from '@prisma/client';
import { userRepository } from '../repositories/user.repository';
import { hashPassword, comparePassword } from '../utils/password.util';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken
} from '../utils/auth/jwt.util';
import { generateRandomToken, hashToken } from '../utils/auth/token.util';
import {
  ConflictError,
  UnauthorizedError,
  NotFoundError,
  BadRequestError
} from '../utils/error.util';
import { sanitizeUser, UserDTO } from '../utils/response.util';
import { Messages } from '../constants/messages';
import { logger } from '../utils/logger.util';
import { emailService } from './email';

export class AuthService {
  /**
   * Registers a new user in the system.
   */
  async register(data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: Role;
}): Promise<{ user: UserDTO; accessToken: string; refreshToken: string }> {

  console.log("================================");
  console.log("REGISTER REQUEST");
  console.log(data);
  console.log("EMAIL:", data.email);

  const existingUser = await userRepository.findByEmail(data.email);

  console.log("FOUND USER:", existingUser);

  if (existingUser) {
    throw new ConflictError(Messages.AUTH.EMAIL_ALREADY_EXISTS);
  }

  const hashedPassword = await hashPassword(data.password);

  const user = await userRepository.createUser({
    email: data.email,
    password: hashedPassword,
    firstName: data.firstName,
    lastName: data.lastName,
    phone: data.phone,
    role: data.role || Role.EMPLOYEE,
  });

  const accessToken = signAccessToken({
    userId: user.id,
    role: user.role,
  });

  const refreshToken = signRefreshToken({
    userId: user.id,
    role: user.role,
    version: user.refreshTokenVersion,
  });

  return {
    user: sanitizeUser(user),
    accessToken,
    refreshToken,
  };
}

  /**
   * Log in user checking credentials, checking status, and updating last login.
   */
  async login(data: {
    email: string;
    password: string;
  }): Promise<{ user: UserDTO; accessToken: string; refreshToken: string }> {
    const user = await userRepository.findByEmail(data.email);
    if (!user) {
      throw new UnauthorizedError(Messages.AUTH.INVALID_CREDENTIALS);
    }

    const isMatch = await comparePassword(data.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedError(Messages.AUTH.INVALID_CREDENTIALS);
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedError(Messages.AUTH.USER_INACTIVE);
    }

    const updatedUser = await userRepository.updateUser(user.id, {
      lastLogin: new Date()
    });

    const accessToken = signAccessToken({
      userId: updatedUser.id,
      role: updatedUser.role
    });
    const refreshToken = signRefreshToken({
      userId: updatedUser.id,
      role: updatedUser.role,
      version: updatedUser.refreshTokenVersion
    });

    return {
      user: sanitizeUser(updatedUser),
      accessToken,
      refreshToken
    };
  }

  /**
   * Logs out user by incrementing token version in database, invalidating active sessions.
   */
  async logout(userId: string): Promise<void> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError(Messages.AUTH.USER_NOT_FOUND);
    }

    await userRepository.updateUser(userId, {
      refreshTokenVersion: {
        increment: 1
      }
    });
  }

  /**
   * Verifies a session refresh token, checks database version, and issues a rotated pair.
   */
  async refresh(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const decoded = verifyRefreshToken(refreshToken);
      const user = await userRepository.findById(decoded.userId);

      if (!user) {
        throw new UnauthorizedError(Messages.AUTH.INVALID_REFRESH_TOKEN);
      }

      if (user.status !== 'ACTIVE') {
        throw new UnauthorizedError(Messages.AUTH.USER_INACTIVE);
      }

      // If token version does not match DB, the session was revoked
      if (decoded.version !== user.refreshTokenVersion) {
        throw new UnauthorizedError(Messages.AUTH.INVALID_REFRESH_TOKEN);
      }

      // Rotate both access and refresh tokens
      const nextAccessToken = signAccessToken({
        userId: user.id,
        role: user.role
      });
      const nextRefreshToken = signRefreshToken({
        userId: user.id,
        role: user.role,
        version: user.refreshTokenVersion
      });

      return {
        accessToken: nextAccessToken,
        refreshToken: nextRefreshToken
      };
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        throw error;
      }
      throw new UnauthorizedError(Messages.AUTH.INVALID_REFRESH_TOKEN);
    }
  }

  /**
   * Triggers the forgot password flow, generating and hashing a token.
   */
  async forgotPassword(email: string): Promise<void> {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      logger.warn(`Password reset requested for non-existing email: ${email}`);
      throw new NotFoundError("Email does not exist or wrong email");
    }

    const rawToken = generateRandomToken();
    const hashedToken = hashToken(rawToken);
    const expiry = new Date(Date.now() + 3600000); // Token valid for 1 hour

    await userRepository.updateUser(user.id, {
      resetPasswordToken: hashedToken,
      resetPasswordExpires: expiry
    });

    const resetLink = `http://localhost:5173/reset-password?token=${rawToken}`;
    emailService.sendPasswordResetEmail(email, resetLink);
  }

  /**
   * Resets password using token verification and invalidates all existing logged sessions.
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    const hashedToken = hashToken(token);
    const user = await userRepository.findByResetToken(hashedToken);

    if (!user) {
      throw new BadRequestError(Messages.AUTH.INVALID_RESET_TOKEN);
    }

    const hashedPassword = await hashPassword(newPassword);

    await userRepository.updateUser(user.id, {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null,
      refreshTokenVersion: {
        increment: 1 // Revoke existing tokens for safety upon password change
      }
    });
  }

  /**
   * Retrieves active profile details for the authenticated user.
   */
  async getCurrentUser(userId: string): Promise<UserDTO> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError(Messages.AUTH.USER_NOT_FOUND);
    }
    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedError(Messages.AUTH.USER_INACTIVE);
    }
    return sanitizeUser(user);
  }
}

export const authService = new AuthService();
