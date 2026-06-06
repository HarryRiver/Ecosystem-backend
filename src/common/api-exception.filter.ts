import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

function inferErrorCode(status: number): string {
  switch (status) {
    case HttpStatus.BAD_REQUEST:
      return 'VALIDATION_ERROR';
    case HttpStatus.UNAUTHORIZED:
      return 'UNAUTHORIZED';
    case HttpStatus.FORBIDDEN:
      return 'FORBIDDEN';
    case HttpStatus.NOT_FOUND:
      return 'NOT_FOUND';
    case HttpStatus.CONFLICT:
      return 'CONFLICT';
    default:
      return 'INTERNAL_SERVER_ERROR';
  }
}

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    const isHttpException = exception instanceof HttpException;
    const status = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;
    const exceptionResponse = isHttpException ? exception.getResponse() : null;

    let message = 'Có lỗi xảy ra ở máy chủ.';
    let errorCode = inferErrorCode(status);

    if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
    } else if (exceptionResponse && typeof exceptionResponse === 'object') {
      const body = exceptionResponse as Record<string, unknown>;
      const rawMessage = body.message;

      if (Array.isArray(rawMessage)) {
        message = rawMessage.join(', ');
      } else if (typeof rawMessage === 'string') {
        message = rawMessage;
      }

      if (
        typeof body.error_code === 'string' &&
        body.error_code.trim() !== ''
      ) {
        errorCode = body.error_code;
      }
    } else if (exception instanceof Error && exception.message) {
      message = exception.message;
    }

    response.status(status).json({
      success: false,
      data: null,
      message,
      error_code: errorCode,
    });
  }
}
