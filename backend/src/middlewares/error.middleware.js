/**
 * 404 Not Found Route Middleware
 */
export const notFoundHandler = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * Centralized Error-Handling Middleware
 * Sanitizes errors, formats responses consistently, and handles Mongoose-specific errors.
 */
export const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  const response = {
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  };

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    response.message = Object.values(err.errors).map((val) => val.message).join(', ');
    return res.status(400).json(response);
  }

  // Mongoose Duplicate Key Error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    response.message = `Duplicate value entered for ${field}. Must be unique.`;
    return res.status(400).json(response);
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    response.message = 'Resource not found. Invalid ID format.';
    return res.status(400).json(response);
  }

  res.status(statusCode).json(response);
};
