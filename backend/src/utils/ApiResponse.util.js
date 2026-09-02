/**
 * Standardized API Response Class
 */
export class ApiResponse {
  /**
   * @param {number} statusCode - HTTP Status Code (e.g. 200, 201)
   * @param {any} data - Response payload data
   * @param {string} message - Success message
   */
  constructor(statusCode, data, message = 'Success') {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }
}
