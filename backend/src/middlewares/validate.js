const { BadRequestError } = require('./errorHandler');

/**
 * Express middleware to validate request bodies against a Zod schema
 * @param {ZodSchema} schema - Zod validation schema
 */
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    // Extract the first validation failure error message
    const firstErrorMessage = result.error.errors[0]?.message || 'Invalid request payload';
    return next(new BadRequestError(firstErrorMessage));
  }
  next();
};

module.exports = validate;
