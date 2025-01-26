// /server/utils/APIResponse.js
/**
 * @typedef {Object} APIResponse
 * @property {boolean} success - Indicates request success status
 * @property {any} [data] - Response payload
 * @property {Object} [error] - Error information
 * @property {number} error.code - HTTP status code
 * @property {string} error.message - Human-readable error message
 * @property {Object} [error.details] - Additional error details (development only)
 */

class APIResponse {
  /**
   * Send successful response
   * @param {Response} res - Express response object
   * @param {any} data - Response data
   * @param {number} [statusCode=200] - HTTP status code
   */
  static success(res, data, statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      data: typeof data === 'undefined' ? null : data
    });
  }

  /**
   * Send error response
   * @param {Response} res - Express response object
   * @param {string} message - Error message
   * @param {number} [statusCode=500] - HTTP status code
   * @param {Error} [error] - Original error object
   */
  static error(res, message, statusCode = 500, error = null) {
    const response = {
      success: false,
      error: {
        code: statusCode,
        message
      }
    };

    if (error && process.env.NODE_ENV === 'development') {
      response.error.details = {
        name: error.name,
        stack: error.stack,
        ...(error.errors && { validationErrors: error.errors })
      };
    }

    return res.status(statusCode).json(response);
  }
}

export default APIResponse;