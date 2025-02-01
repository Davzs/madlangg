export class APIError extends Error {
  public statusCode: number;
  public data?: any;

  constructor(message: string, statusCode: number = 500, data?: any) {
    super(message);
    this.statusCode = statusCode;
    this.data = data;
    this.name = 'APIError';
  }
}

export const handleAPIError = (error: unknown) => {
  if (error instanceof APIError) {
    return new Response(
      JSON.stringify({
        error: error.message,
        data: error.data,
      }),
      { status: error.statusCode }
    );
  }

  console.error('Unhandled error:', error);
  return new Response(
    JSON.stringify({
      error: 'Internal server error',
    }),
    { status: 500 }
  );
};

export const validateRequestBody = <T>(
  body: unknown,
  requiredFields: (keyof T)[]
): T => {
  if (!body || typeof body !== 'object') {
    throw new APIError('Invalid request body', 400);
  }

  for (const field of requiredFields) {
    if (!(field in body)) {
      throw new APIError(`Missing required field: ${String(field)}`, 400);
    }
  }

  return body as T;
};
