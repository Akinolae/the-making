import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { ValidationError } from '../utils/errors';

/**
 * Express middleware to validate request body using a Zod schema.
 */
export function validateBody(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      // Return the first validation error message
      const errorMsg = result.error.errors[0]?.message || 'Validation failed';
      return next(new ValidationError(errorMsg));
    }
    // Set the parsed and validated data back on the request body
    req.body = result.data;
    next();
  };
}
