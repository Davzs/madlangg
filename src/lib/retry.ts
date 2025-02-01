interface RetryOptions {
  maxAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  retryableErrors?: string[];
}

const defaultOptions: Required<RetryOptions> = {
  maxAttempts: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2,
  retryableErrors: ['NETWORK_ERROR', 'RATE_LIMIT_ERROR'],
};

export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...defaultOptions, ...options };
  let lastError: Error | null = null;
  let delay = opts.initialDelay;

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      
      const errorCode = error?.code || 'UNKNOWN_ERROR';
      if (!opts.retryableErrors.includes(errorCode)) {
        throw error;
      }

      if (attempt === opts.maxAttempts) {
        break;
      }

      // Calculate exponential backoff with jitter
      const jitter = Math.random() * 200;
      delay = Math.min(delay * opts.backoffFactor + jitter, opts.maxDelay);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error('Operation failed after maximum retries');
}
