import { ApiError } from './ApiError.util.js';

/**
 * 404 Not Found Middleware
 */
export const notFoundHandler = (req, res, next) => {
  const error = new ApiError(404, `Not Found - ${req.originalUrl}`);
  next(error);
};

/**
 * Centralized Express Error Handling Middleware
 * Converts uncaught errors & Mongoose errors to ApiError instances.
 */
export const errorHandler = (err, req, res, next) => {
  let error = err;

  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);
    let message = error.message || 'Internal Server Error';
    let errors = [];

    // Mongoose Validation Error
    if (error.name === 'ValidationError') {
      message = 'Validation Error';
      errors = Object.values(error.errors).map((val) => val.message);
    } 
    // Mongoose Duplicate Key Error
    else if (error.code === 11000) {
      const field = Object.keys(error.keyValue || {})[0] || 'field';
      message = `Duplicate value entered for ${field}. Must be unique.`;
    } 
    // Mongoose CastError (invalid ObjectId)
    else if (error.name === 'CastError') {
      message = `Invalid ID format for ${error.path}`;
    }

    error = new ApiError(statusCode, message, errors, error.stack);
  }

  const response = {
    success: false,
    statusCode: error.statusCode,
    message: error.message,
    errors: error.errors,
    ...(process.env.NODE_ENV !== 'production' && { stack: error.stack }),
  };

  return res.status(error.statusCode).json(response);
};
