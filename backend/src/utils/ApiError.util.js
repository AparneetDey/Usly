/**
 * Standardized Custom API Error Class
 */
export class ApiError extends Error {
  /**
   * @param {number} statusCode - HTTP Status Code (e.g. 400, 401, 404, 500)
   * @param {string} message - Error message
   * @param {Array} errors - Array of error details/validation messages
   * @param {string} stack - Optional stack trace
   */
  constructor(
    statusCode,
    message = 'Something went wrong',
    errors = [],
    stack = ''
  ) {
    super(message);
    this.statusCode = statusCode;
    this.data = null;
    this.message = message;
    this.success = false;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
