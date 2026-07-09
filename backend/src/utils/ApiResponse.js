class ApiResponse {
  constructor(success, message, data = null, errors = null) {
    this.success = success;
    this.message = message;
    if (data) this.data = data;
    if (errors) this.errors = errors;
    this.timestamp = new Date().toISOString();
  }

  static success(message, data = null, statusCode = 200) {
    const response = new ApiResponse(true, message, data);
    response.statusCode = statusCode;
    return response;
  }

  static error(message, errors = null, statusCode = 400) {
    const response = new ApiResponse(false, message, null, errors);
    response.statusCode = statusCode;
    return response;
  }

  static created(message, data = null) {
    return this.success(message, data, 201);
  }

  static ok(message, data = null) {
    return this.success(message, data, 200);
  }

  static noContent(message = 'No content found') {
    return this.success(message, null, 204);
  }

  static notFound(message = 'Resource not found') {
    return this.error(message, null, 404);
  }

  static unauthorized(message = 'Unauthorized access') {
    return this.error(message, null, 401);
  }

  static forbidden(message = 'Access forbidden') {
    return this.error(message, null, 403);
  }

  static badRequest(message = 'Bad request', errors = null) {
    return this.error(message, errors, 400);
  }

  static internalError(message = 'Internal server error', errors = null) {
    return this.error(message, errors, 500);
  }

  toResponse(res, overrideStatusCode = null) {
    const statusCode = overrideStatusCode || this.statusCode || 200;
    return res.status(statusCode).json(this);
  }
}

module.exports = ApiResponse;