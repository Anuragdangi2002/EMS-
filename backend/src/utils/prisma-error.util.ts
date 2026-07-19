import { Prisma } from '@prisma/client';
import { ConflictError, NotFoundError } from './error.util';

/**
 * Parses raw Prisma Client exceptions and maps them to clean application operational errors.
 */
export const handlePrismaError = (error: unknown): unknown => {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002': {
        // Unique constraint violation
        const fields = (error.meta?.target as string[]) || [];
        const fieldMsg = fields.length ? ` (${fields.join(', ')})` : '';
        return new ConflictError(`Unique constraint violation: record already exists${fieldMsg}`);
      }
      case 'P2025': {
        // Record not found
        return new NotFoundError('Requested database record was not found');
      }
      default:
        break;
    }
  }
  return error;
};
