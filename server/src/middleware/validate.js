import { ApiError } from '../utils/ApiError.js';

export const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const formattedErrors = result.error.issues.map((issue) => {
        const field = issue.path.join('.');
        return field ? `${field}: ${issue.message}` : issue.message;
      });

      return next(new ApiError(422, 'Validation Error', formattedErrors));
    }

    // Replace request payload with sanitized & parsed Zod output
    req[source] = result.data;
    next();
  };
};
