import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  message: string | null;
  error_code: string | null;
};

function isApiEnvelope<T>(value: unknown): value is ApiEnvelope<T> {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.success === 'boolean' &&
    'data' in candidate &&
    'message' in candidate &&
    'error_code' in candidate
  );
}

@Injectable()
export class ApiResponseInterceptor<T> implements NestInterceptor<
  T,
  ApiEnvelope<T>
> {
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiEnvelope<T>> {
    return next.handle().pipe(
      map((data: T | ApiEnvelope<T>) => {
        if (isApiEnvelope<T>(data)) {
          return data;
        }

        return {
          success: true,
          data,
          message: null,
          error_code: null,
        };
      }),
    );
  }
}
