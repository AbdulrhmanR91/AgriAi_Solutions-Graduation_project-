import process from 'process';

/**
 * Custom error class to handle API errors with status codes and additional context
 * @class ErrorResponse
 * @extends Error
 */
export class ErrorResponse extends Error {
  /**
   * Create an error response
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   * @param {object} additionalData - Any additional error context
   */
  constructor(message, statusCode = 500, additionalData = {}) {
    super(message);
    this.statusCode = statusCode;
    this.additionalData = additionalData;
    this.isOperational = true; // Indicates this is an operational error
    
    // Set error name to the class name
    this.name = this.constructor.name;
    
    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
  }
  
  /**
   * Convert error to JSON representation
   * @returns {object} JSON representation of error
   */
  toJSON() {
    return {
      success: false,
      status: this.statusCode,
      message: this.message,
      ...(process.env.NODE_ENV === 'development' && {
        stack: this.stack,
        additionalData: this.additionalData
      })
    };
  }
}

/**
 * Create a 400 Bad Request error
 * @param {string} message - Error message
 * @param {object} additionalData - Additional context
 * @returns {ErrorResponse} Error response object
 */
export const BadRequestError = (message = 'Bad Request', additionalData = {}) => {
  return new ErrorResponse(message, 400, additionalData);
};

/**
 * Create a 401 Unauthorized error
 * @param {string} message - Error message
 * @returns {ErrorResponse} Error response object
 */
export const UnauthorizedError = (message = 'Unauthorized') => {
  return new ErrorResponse(message, 401);
};

/**
 * Create a 403 Forbidden error
 * @param {string} message - Error message
 * @returns {ErrorResponse} Error response object
 */
export const ForbiddenError = (message = 'Forbidden') => {
  return new ErrorResponse(message, 403);
};

/**
 * Create a 404 Not Found error
 * @param {string} message - Error message
 * @param {string} resource - Resource type that wasn't found
 * @returns {ErrorResponse} Error response object
 */
export const NotFoundError = (message = 'Resource not found', resource = 'Resource') => {
  return new ErrorResponse(message, 404, { resource });
};

// Add default export for compatibility with modules expecting a default import
export default ErrorResponse;
