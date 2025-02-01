export class AIServiceError extends Error {
  code: string;
  details?: any;

  constructor(message: string, code: string, details?: any) {
    super(message);
    this.name = 'AIServiceError';
    this.code = code;
    this.details = details;
  }

  static fromError(error: any): AIServiceError {
    if (error instanceof AIServiceError) {
      return error;
    }

    // OpenAI API errors
    if (error?.response?.data?.error) {
      return new AIServiceError(
        error.response.data.error.message,
        'OPENAI_API_ERROR',
        error.response.data.error
      );
    }

    // Network errors
    if (error?.code === 'ECONNREFUSED' || error?.code === 'ECONNRESET') {
      return new AIServiceError(
        'Unable to connect to the AI service. Please check your internet connection.',
        'NETWORK_ERROR',
        error
      );
    }

    // Rate limiting
    if (error?.response?.status === 429) {
      return new AIServiceError(
        'Too many requests. Please try again later.',
        'RATE_LIMIT_ERROR',
        error
      );
    }

    // Authentication errors
    if (error?.response?.status === 401) {
      return new AIServiceError(
        'Authentication failed. Please check your API key.',
        'AUTH_ERROR',
        error
      );
    }

    // Default error
    return new AIServiceError(
      'An unexpected error occurred',
      'UNKNOWN_ERROR',
      error
    );
  }
}
