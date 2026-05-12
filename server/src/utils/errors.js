/**
 * Custom application error classes.
 *
 * These provide structured error handling across the service and API layers,
 * with appropriate HTTP status codes and machine-readable error types.
 */

class AppError extends Error {
  /**
   * @param {string} message  - Human-readable error message
   * @param {number} statusCode - HTTP status code
   * @param {string} type     - Machine-readable error type
   */
  constructor(message, statusCode, type) {
    super(message);
    this.statusCode = statusCode;
    this.type = type;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  /**
   * @param {string} message - Validation failure description
   * @param {Array}  [errors] - Array of individual field errors
   */
  constructor(message, errors = []) {
    super(message, 400, 'VALIDATION_ERROR');
    this.errors = errors;
  }
}

class NotFoundError extends AppError {
  /**
   * @param {string} resource - The resource type (e.g., 'Employee')
   * @param {string} id       - The ID that was not found
   */
  constructor(resource, id) {
    super(`${resource} with id '${id}' not found`, 404, 'NOT_FOUND');
    this.resource = resource;
  }
}

class ConflictError extends AppError {
  /**
   * @param {string} message - Conflict description (e.g., duplicate email)
   */
  constructor(message) {
    super(message, 409, 'CONFLICT');
  }
}

module.exports = { AppError, ValidationError, NotFoundError, ConflictError };
