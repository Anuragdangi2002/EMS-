import { Response } from 'express';

export interface UserDTO {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  role: any;
  status: string;
  isEmailVerified: boolean;
  mustChangePassword: boolean;
  lastLogin: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

/**
 * Sanitizes a raw User database object to remove sensitive credentials.
 */
export const sanitizeUser = (user: any): UserDTO => {
  const {
    password,
    refreshTokenVersion,
    resetPasswordToken,
    resetPasswordExpires,
    ...sanitized
  } = user;
  if (sanitized.role === 'DIRECTOR') {
    sanitized.role = 'ADMIN';
  }
  return sanitized as UserDTO;
};

/**
 * Sends a standardized HTTP success response.
 */
export const sendSuccess = (
  res: Response,
  data: any = null,
  message: string = 'Success',
  statusCode: number = 200
): void => {
  res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

/**
 * Sends a standardized HTTP error response.
 */
export const sendError = (
  res: Response,
  message: string = 'Error occurred',
  errors: any[] = [],
  statusCode: number = 400
): void => {
  res.status(statusCode).json({
    success: false,
    message,
    errors
  });
};

/**
 * Sends a standardized paginated HTTP success response.
 */
export const sendPaginated = <T>(
  res: Response,
  items: T[],
  total: number,
  page: number,
  limit: number,
  message: string = 'Success'
): void => {
  const totalPages = Math.ceil(total / limit);
  res.status(200).json({
    success: true,
    message,
    data: {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    }
  });
};
