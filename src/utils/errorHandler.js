import logger from './logger.js';


export class CustomError extends Error {
  constructor(code, message, details = null) {
    super(message);
    this.code = code;
    this.details = details;
  }
}


export const errorDictionary = {
  INCOMPLETE_VALUES: {
    code: 400,
    message: 'Incomplete values provided',
  },
  PET_NOT_FOUND: {
    code: 404,
    message: 'Pet not found',
  },
  USER_NOT_FOUND: {
    code: 404,
    message: 'User not found',
  },
  INVALID_ROLE: {
    code: 400,
    message: 'Invalid user role provided',
  },
  DATABASE_ERROR: {
    code: 500,
    message: 'Database error occurred',
  },
  MOCKING_ERROR: {
    code: 500,
    message: 'Error generating mock data',
  },
  VALIDATION_ERROR: {
    code: 400,
    message: 'Validation failed: Missing or invalid fields',
  },
  MISSING_PARAMETERS: {
    code: 400,
    message: 'Missing required parameters'
  }
};

// Middleware de manejo de errores
export const errorHandlerMiddleware = (err, req, res, next) => {
  logger.error(`[${err.name || 'Error'}] ${err.message}`, {
    code: err.code || 500,
    stack: err.stack,
    details: err.details || null,
    url: req.originalUrl,
    method: req.method
  });

  res.status(err.code || 500).json({
    status: 'error',
    message: err.message || 'Unexpected error'
  });
};
