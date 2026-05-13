/**
 * Generic Input Sanitizer Middleware
 *
 * Recursively strips keys starting with '$' or containing '.' to prevent
 * basic NoSQL injection patterns across body, query, and parameter structures.
 */
const sanitizeObject = (target) => {
  if (target instanceof Array) {
    target.forEach((item) => sanitizeObject(item));
  } else if (target && typeof target === 'object') {
    Object.keys(target).forEach((key) => {
      // If a key contains injection path vectors, delete it
      if (key.startsWith('$') || key.includes('.')) {
        delete target[key];
      } else {
        sanitizeObject(target[key]);
      }
    });
  }
};

const sanitize = (req, res, next) => {
  if (req.body) sanitizeObject(req.body);
  if (req.query) sanitizeObject(req.query);
  if (req.params) sanitizeObject(req.params);
  next();
};

module.exports = sanitize;
