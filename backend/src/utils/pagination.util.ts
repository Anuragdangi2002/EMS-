import { Request } from 'express';

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  search?: string;
}

/**
 * Parses and normalises pagination, sorting, and search parameters from the request query.
 * Applies safe defaults and caps the maximum limit to prevent abuse.
 */
export const parsePagination = (
  req: Request,
  defaultSortBy: string = 'createdAt',
  maxLimit: number = 100
): PaginationParams => {
  const page = Math.max(1, parseInt((req.query.page as string) || '1', 10));
  const rawLimit = parseInt((req.query.limit as string) || '10', 10);
  const limit = Math.min(Math.max(1, rawLimit), maxLimit);
  const skip = (page - 1) * limit;
  const sortBy = (req.query.sortBy as string) || defaultSortBy;
  const sortOrder: 'asc' | 'desc' =
    (req.query.sortOrder as string)?.toLowerCase() === 'asc' ? 'asc' : 'desc';
  const search = (req.query.search as string)?.trim() || undefined;

  return { page, limit, skip, sortBy, sortOrder, search };
};

/**
 * Builds a Prisma-compatible orderBy object from sortBy/sortOrder.
 */
export const buildOrderBy = (
  sortBy: string,
  sortOrder: 'asc' | 'desc',
  allowedFields: string[],
  defaultField: string = 'createdAt'
): Record<string, 'asc' | 'desc'> => {
  const field = allowedFields.includes(sortBy) ? sortBy : defaultField;
  return { [field]: sortOrder };
};
