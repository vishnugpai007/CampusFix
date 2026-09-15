import { ApiError } from '../utils/ApiError.js';
import { env } from '../config/env.js';

export const errorHandler = (err, req, res, next) => {
  let error = err;

  // Convert non-ApiError instances into normalized ApiError
  if (!(error instanceof ApiError)) {
    let statusCode = error.statusCode || 500;
    let message = error.message || 'Internal Server Error';
    let errors = [];

    // Handle Mongoose Validation Error
    if (err.name === 'ValidationError' && err.errors) {
      statusCode = 400;
      message = 'Validation Error';
      errors = Object.values(err.errors).map((el) => el.message);
    }
    // Handle Mongoose CastError (invalid ObjectId)
    else if (err.name === 'CastError') {
      statusCode = 400;
      message = `Invalid format for field '${err.path}'`;
    }
    // Handle Mongoose Duplicate Key Error (code 11000)
    else if (err.code === 11000) {
      statusCode = 400;
      const keys = Object.keys(err.keyValue || {});
      message = `Duplicate entry for ${keys.join(', ')}`;
    }
    // Handle JWT Error
    else if (err.name === 'JsonWebTokenError') {
      statusCode = 401;
      message = 'Invalid authentication token';
    }
    // Handle JWT Expired Error
    else if (err.name === 'TokenExpiredError') {
      statusCode = 401;
      message = 'Authentication token has expired';
    }

    error = new ApiError(statusCode, message, errors, err.stack);
  }

  // Information disclosure protection: In production, mask raw 500 internal server messages
  const responseMessage =
    env.NODE_ENV === 'production' && error.statusCode === 500
      ? 'Internal Server Error'
      : error.message;

  const response = {
    success: false,
    statusCode: error.statusCode,
    message: responseMessage,
    errors: error.errors,
    ...(env.NODE_ENV !== 'production' && { stack: error.stack })
  };

  res.status(error.statusCode).json(response);
};
