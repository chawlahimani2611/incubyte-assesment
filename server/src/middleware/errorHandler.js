const { AppError } = require('../utils/errors');

/**
 * Global Error Handler Middleware
 *
 * Intercepts all errors thrown within Express routes/controllers/services
 * and formats them into a consistent, machine-readable JSON response.
 */
const errorHandler = (err, req, res, next) => {
  // If error is an instance of our AppError, use its properties
  const statusCode = err.statusCode || 500;
  const type = err.type || 'INTERNAL_SERVER_ERROR';
  const message = err.message || 'An unexpected error occurred';
  const details = err.errors || undefined;

  // Log unexpected internal errors
  if (statusCode === 500 && process.env.NODE_ENV !== 'test') {
    console.error('💥 Internal Server Error:', err);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      type,
      message,
      ...(details && { details }),
    },
  });
};

module.exports = errorHandler;
