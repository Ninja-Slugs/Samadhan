import "reflect-metadata";
import { randomUUID } from "node:crypto";
import { plainToInstance, type ClassConstructor } from "class-transformer";
import { validate } from "class-validator";
import { NextResponse, type NextRequest } from "next/server";

export const HttpStatus = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  GONE: 410,
  UNPROCESSABLE: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
} as const;

export class AppException extends Error {
  readonly status: number;
  readonly code: string;
  readonly fields?: Record<string, string>;

  constructor(
    status: number,
    code: string,
    message: string,
    fields?: Record<string, string>
  ) {
    super(message);
    this.name = "AppException";
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

export function toErrorResponse(error: unknown): NextResponse {
  if (error instanceof AppException) {
    return NextResponse.json(
      {
        error: {
          code: error.code,
          message: error.message,
          fields: error.fields,
          requestId: randomUUID()
        }
      },
      { status: error.status }
    );
  }

  console.error(error);
  return NextResponse.json(
    {
      error: {
        code: "internal_error",
        message: "Something went wrong. Please try again.",
        requestId: randomUUID()
      }
    },
    { status: HttpStatus.INTERNAL_SERVER_ERROR }
  );
}

export function withRoute(
  handler: (request: NextRequest) => Promise<unknown>,
  status: number = HttpStatus.OK
) {
  return async (request: NextRequest) => {
    try {
      const data = await handler(request);
      return NextResponse.json({ data }, { status });
    } catch (error) {
      return toErrorResponse(error);
    }
  };
}

export function withParamsRoute<P extends Record<string, string>>(
  handler: (request: NextRequest, params: P) => Promise<unknown>,
  status: number = HttpStatus.OK
) {
  return async (request: NextRequest, context: { params: Promise<P> }) => {
    try {
      const params = await context.params;
      const data = await handler(request, params);
      return NextResponse.json({ data }, { status });
    } catch (error) {
      return toErrorResponse(error);
    }
  };
}

export async function validateDto<T extends object>(
  DtoClass: ClassConstructor<T>,
  payload: unknown
): Promise<T> {
  const instance = plainToInstance(DtoClass, payload ?? {});
  const errors = await validate(instance, {
    whitelist: true,
    forbidNonWhitelisted: true
  });

  if (errors.length > 0) {
    const fields: Record<string, string> = {};
    for (const error of errors) {
      const constraints = Object.values(error.constraints ?? {});
      if (constraints.length > 0) {
        fields[error.property] = constraints[0];
      }
    }
    throw new AppException(
      HttpStatus.BAD_REQUEST,
      "validation_error",
      "The request could not be processed.",
      fields
    );
  }

  return instance;
}

export async function readJsonBody(request: NextRequest): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

export function queryToObject(request: NextRequest): Record<string, string> {
  return Object.fromEntries(request.nextUrl.searchParams.entries());
}
