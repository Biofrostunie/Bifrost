import { Request, Response, NextFunction } from 'express';
import { AppError, ErrorCode } from '../types';

/**
 * Global error handling middleware
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error(`[Error] ${err.message}`, err);

  // Default error response
  let statusCode = 500;
  let message = 'Internal Server Error';
  let code = ErrorCode.INTERNAL_SERVER;
  let errors: any = undefined;

  // Handle custom AppError instances
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    code = err.code;
  }

  // Handle validation errors
  if (err.name === 'ValidationError' || err.name === 'ZodError') {
    statusCode = 422;
    message = 'Validation Error';
    code = ErrorCode.VALIDATION;
    errors = err;
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    code,
    message,
    errors,
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
};

/**
 * Not found error handler middleware
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    code: ErrorCode.NOT_FOUND,
    message: `Route ${req.originalUrl} not found`,
  });
};