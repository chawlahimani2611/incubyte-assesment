const { ValidationError } = require('../utils/errors');

/**
 * Request Validation Middleware Factory
 *
 * Validates request data (body, query, or params) against a provided Zod schema.
 * Passes formatted ValidationError to the global error handler on failure.
 *
 * @param {Object} schemas
 * @param {import('zod').ZodSchema} [schemas.body]   - Schema for req.body
 * @param {import('zod').ZodSchema} [schemas.query]  - Schema for req.query
 * @param {import('zod').ZodSchema} [schemas.params] - Schema for req.params
 */
const validate = (schemas) => {
  return (req, res, next) => {
    try {
      if (schemas.body) {
        const parsed = schemas.body.safeParse(req.body);
        if (!parsed.success) {
          const errors = parsed.error.errors.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          }));
          throw new ValidationError('Invalid request body', errors);
        }
        req.body = parsed.data; // Replace with sanitized/coerced data
      }

      if (schemas.query) {
        const parsed = schemas.query.safeParse(req.query);
        if (!parsed.success) {
          const errors = parsed.error.errors.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          }));
          throw new ValidationError('Invalid request query parameters', errors);
        }
        req.query = parsed.data;
      }

      if (schemas.params) {
        const parsed = schemas.params.safeParse(req.params);
        if (!parsed.success) {
          const errors = parsed.error.errors.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          }));
          throw new ValidationError('Invalid request URL parameters', errors);
        }
        req.params = parsed.data;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = validate;
