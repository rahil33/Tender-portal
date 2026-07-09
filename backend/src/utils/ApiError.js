class ApiError extends Error {
  constructor(message, statusCode = 400, isOperational = true, code = 'API_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.status = statusCode;
    this.isOperational = isOperational;
    this.code = code;
    this.timestamp = new Date().toISOString();

    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message, code = 'BAD_REQUEST') {
    return new ApiError(message, 400, true, code);
  }

  static unauthorized(message, code = 'UNAUTHORIZED') {
    return new ApiError(message, 401, true, code);
  }

  static forbidden(message, code = 'FORBIDDEN') {
    return new ApiError(message, 403, true, code);
  }

  static notFound(message, code = 'NOT_FOUND') {
    return new ApiError(message, 404, true, code);
  }

  static conflict(message, code = 'CONFLICT') {
    return new ApiError(message, 409, true, code);
  }

  static tooManyRequests(message, code = 'TOO_MANY_REQUESTS') {
    return new ApiError(message, 429, true, code);
  }

  static validationError(message, errors = [], code = 'VALIDATION_ERROR') {
    const error = new ApiError(message, 400, true, code);
    error.errors = errors;
    return error;
  }

  static internal(message = 'Internal server error', code = 'INTERNAL_ERROR') {
    return new ApiError(message, 500, false, code);
  }

  static database(message = 'Database error', code = 'DATABASE_ERROR') {
    return new ApiError(message, 500, false, code);
  }

  static fileUpload(message = 'File upload failed', code = 'FILE_UPLOAD_ERROR') {
    return new ApiError(message, 400, true, code);
  }

  toJSON() {
    return {
      success: false,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      timestamp: this.timestamp,
      ...(this.errors && { errors: this.errors }),
    };
  }
}

module.exports = ApiError;