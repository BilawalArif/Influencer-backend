import { AppError } from './appError';
import { Response } from 'express';

export const handleError = (err: AppError, res: Response) => {
  const { statusCode, status, message } = err;

  res.status(statusCode).json({
    status,
    message,
  });
};

export const handleNotFoundError = (resource: string) => {
  return new AppError(`${resource} not found`, 404);
};

export const handleDuplicateKeyError = (key: string) => {
  return new AppError(`Duplicate key error: ${key} already exists`, 400);
};

export const handleValidationError = (message: string) => {
  return new AppError(`Validation error: ${message}`, 400);
};

export const handleJWTError = () => {
  return new AppError('Invalid token. Please log in again.', 401);
};

export const handleJWTExpiredError = () => {
  return new AppError('Token expired. Please log in again.', 401);
};
