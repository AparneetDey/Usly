/**
 * Utility wrapper for async route handlers.
 * Catches rejected promises and forwards errors to Express's next() middleware.
 *
 * @param {Function} requestHandler - Async express route handler function
 * @returns {Function} Express middleware function
 */
export const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};
