/**
 * ConnectHub Shared SDK - Unified Error Handling
 * Cross-platform error handling for Web and Mobile apps
 */

export enum ErrorCode {
  // Network Errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  NO_INTERNET = 'NO_INTERNET',
  
  // Authentication Errors
  UNAUTHORIZED = 'UNAUTHORIZED',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  
  // Validation Errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  
  // Resource Errors
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  FORBIDDEN = 'FORBIDDEN',
  
  // Server Errors
  SERVER_ERROR = 'SERVER_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  
  // Client Errors
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export class ConnectHubError extends Error {
  public code: ErrorCode;
  public statusCode?: number;
  public details?: any;
  public timestamp: Date;

  constructor(
    message: string,
    code: ErrorCode = ErrorCode.UNKNOWN_ERROR,
    statusCode?: number,
    details?: any
  ) {
    super(message);
    this.name = 'ConnectHubError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.timestamp = new Date();
    
    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      details: this.details,
      timestamp: this.timestamp.toISOString(),
    };
  }
}

export class NetworkError extends ConnectHubError {
  constructor(message: string = 'Network connection failed', details?: any) {
    super(message, ErrorCode.NETWORK_ERROR, undefined, details);
    this.name = 'NetworkError';
  }
}

export class AuthenticationError extends ConnectHubError {
  constructor(message: string = 'Authentication failed', details?: any) {
    super(message, ErrorCode.UNAUTHORIZED, 401, details);
    this.name = 'AuthenticationError';
  }
}

export class ValidationError extends ConnectHubError {
  constructor(message: string = 'Validation failed', details?: any) {
    super(message, ErrorCode.VALIDATION_ERROR, 400, details);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends ConnectHubError {
  constructor(message: string = 'Resource not found', details?: any) {
    super(message, ErrorCode.NOT_FOUND, 404, details);
    this.name = 'NotFoundError';
  }
}

export class ServerError extends ConnectHubError {
  constructor(message: string = 'Server error occurred', details?: any) {
    super(message, ErrorCode.SERVER_ERROR, 500, details);
    this.name = 'ServerError';
  }
}

/**
 * Error Handler - Unified error handling across platforms
 */
export class ErrorHandler {
  private static listeners: Array<(error: ConnectHubError) => void> = [];

  /**
   * Register error listener
   */
  static onError(callback: (error: ConnectHubError) => void) {
    this.listeners.push(callback);
  }

  /**
   * Handle error and notify listeners
   */
  static handle(error: Error | ConnectHubError): ConnectHubError {
    const connectHubError = this.normalizeError(error);
    
    // Notify all listeners
    this.listeners.forEach(listener => {
      try {
        listener(connectHubError);
      } catch (e) {
        console.error('Error in error listener:', e);
      }
    });

    return connectHubError;
  }

  /**
   * Convert any error to ConnectHubError
   */
  static normalizeError(error: any): ConnectHubError {
    if (error instanceof ConnectHubError) {
      return error;
    }

    // Handle Axios errors
    if (error.isAxiosError) {
      return this.handleAxiosError(error);
    }

    // Handle standard Error
    if (error instanceof Error) {
      return new ConnectHubError(
        error.message,
        ErrorCode.UNKNOWN_ERROR
      );
    }

    // Handle unknown errors
    return new ConnectHubError(
      'An unknown error occurred',
      ErrorCode.UNKNOWN_ERROR,
      undefined,
      error
    );
  }

  /**
   * Handle Axios-specific errors
   */
  private static handleAxiosError(error: any): ConnectHubError {
    if (!error.response) {
      // Network error
      return new NetworkError(
        error.message || 'Network connection failed',
        { originalError: error }
      );
    }

    const { status, data } = error.response;

    switch (status) {
      case 401:
        return new AuthenticationError(
          data?.message || 'Unauthorized',
          data
        );
      
      case 403:
        return new ConnectHubError(
          data?.message || 'Forbidden',
          ErrorCode.FORBIDDEN,
          403,
          data
        );
      
      case 404:
        return new NotFoundError(
          data?.message || 'Resource not found',
          data
        );
      
      case 422:
      case 400:
        return new ValidationError(
          data?.message || 'Validation failed',
          data
        );
      
      case 500:
      case 502:
      case 503:
        return new ServerError(
          data?.message || 'Server error',
          data
        );
      
      default:
        return new ConnectHubError(
          data?.message || `HTTP ${status} error`,
          ErrorCode.UNKNOWN_ERROR,
          status,
          data
        );
    }
  }

  /**
   * Get user-friendly error message
   */
  static getUserMessage(error: ConnectHubError): string {
    switch (error.code) {
      case ErrorCode.NETWORK_ERROR:
        return 'Unable to connect. Please check your internet connection.';
      
      case ErrorCode.TIMEOUT:
        return 'Request timed out. Please try again.';
      
      case ErrorCode.NO_INTERNET:
        return 'No internet connection. Please check your network.';
      
      case ErrorCode.UNAUTHORIZED:
        return 'Please log in to continue.';
      
      case ErrorCode.TOKEN_EXPIRED:
        return 'Your session has expired. Please log in again.';
      
      case ErrorCode.INVALID_CREDENTIALS:
        return 'Invalid email or password.';
      
      case ErrorCode.VALIDATION_ERROR:
        return error.details?.message || 'Please check your input and try again.';
      
      case ErrorCode.NOT_FOUND:
        return 'The requested content could not be found.';
      
      case ErrorCode.FORBIDDEN:
        return 'You don\'t have permission to access this resource.';
      
      case ErrorCode.SERVER_ERROR:
        return 'Something went wrong on our end. Please try again later.';
      
      default:
        return error.message || 'An unexpected error occurred.';
    }
  }

  /**
   * Log error (can be overridden for different platforms)
   */
  static log(error: ConnectHubError) {
    console.error('[ConnectHub Error]', {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      timestamp: error.timestamp,
      details: error.details,
      stack: error.stack,
    });
  }
}

/**
 * Retry utility for handling transient errors
 */
export async function retryOperation<T>(
  operation: () => Promise<T>,
  options: {
    maxAttempts?: number;
    delayMs?: number;
    exponentialBackoff?: boolean;
    retryableErrors?: ErrorCode[];
  } = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    delayMs = 1000,
    exponentialBackoff = true,
    retryableErrors = [ErrorCode.NETWORK_ERROR, ErrorCode.TIMEOUT, ErrorCode.SERVER_ERROR],
  } = options;

  let lastError: any;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      const normalizedError = ErrorHandler.normalizeError(error);

      // Don't retry if error is not retryable
      if (!retryableErrors.includes(normalizedError.code)) {
        throw normalizedError;
      }

      // Don't retry on last attempt
      if (attempt === maxAttempts) {
        throw normalizedError;
      }

      // Calculate delay with optional exponential backoff
      const delay = exponentialBackoff
        ? delayMs * Math.pow(2, attempt - 1)
        : delayMs;

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw ErrorHandler.normalizeError(lastError);
}

export default {
  ErrorCode,
  ConnectHubError,
  NetworkError,
  AuthenticationError,
  ValidationError,
  NotFoundError,
  ServerError,
  ErrorHandler,
  retryOperation,
};
