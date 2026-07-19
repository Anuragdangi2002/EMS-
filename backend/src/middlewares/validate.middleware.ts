import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { ValidationError } from '../utils/error.util';

/**
 * Reusable validation compiler middleware wrapping request segments against Zod schemas.
 */
export const validate = (schema: {
  body?: AnyZodObject;
  query?: AnyZodObject;
  params?: AnyZodObject;
}) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (schema.body) {
        req.body = await schema.body.parseAsync(req.body);
      }
      if (schema.query) {
        req.query = await schema.query.parseAsync(req.query);
      }
      if (schema.params) {
        req.params = await schema.params.parseAsync(req.params);
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Map Zod errors to structured field/message records
        const details = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message
        }));
        next(new ValidationError('Input validation failed', details));
      } else {
        next(error);
      }
    }
  };
};
