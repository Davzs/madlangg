import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export async function errorHandler(
  request: NextRequest,
  fn: (request: NextRequest) => Promise<Response>
) {
  try {
    return await fn(request);
  } catch (error) {
    console.error('Error:', error);

    if (error instanceof AppError) {
      return NextResponse.json(
        {
          error: {
            message: error.message,
            code: error.code,
          },
        },
        { status: error.statusCode }
      );
    }

    // Handle OpenAI API errors
    if (error?.response?.status) {
      return NextResponse.json(
        {
          error: {
            message: error.response.data?.error?.message || 'OpenAI API error',
            code: 'OPENAI_ERROR',
          },
        },
        { status: error.response.status }
      );
    }

    // Default error response
    return NextResponse.json(
      {
        error: {
          message: 'Internal server error',
          code: 'INTERNAL_SERVER_ERROR',
        },
      },
      { status: 500 }
    );
  }
}
