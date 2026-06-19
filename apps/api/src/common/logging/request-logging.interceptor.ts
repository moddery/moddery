import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  Logger,
  type NestInterceptor,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GqlExecutionContext } from '@nestjs/graphql';
import { type GraphQLResolveInfo } from 'graphql';
import { catchError, Observable, tap, throwError } from 'rxjs';

import {
  graphqlRequestLogSummary,
  httpRequestLogSummary,
  type RequestLike,
  type RequestLogSummary,
  shouldSkipRequestLog,
} from './request-log-summary.js';

@Injectable()
export class RequestLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(RequestLoggingInterceptor.name);

  constructor(private readonly config: ConfigService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (!this.config.get<boolean>('app.requestLoggingEnabled', true)) {
      return next.handle();
    }

    const startedAt = performance.now();
    const summary = requestSummaryFromContext(context);

    if (shouldSkipRequestLog(summary)) {
      return next.handle();
    }

    return next.handle().pipe(
      tap(() => {
        this.logSuccess(summary, performance.now() - startedAt);
      }),
      catchError((error: unknown) => {
        this.logFailure(summary, performance.now() - startedAt, error);
        return throwError(() => error);
      }),
    );
  }

  private logSuccess(summary: RequestLogSummary, durationMs: number): void {
    this.logger.log({
      durationMs: Math.round(durationMs),
      event: 'request_completed',
      operation: summary.operation,
      path: summary.path,
      status: 'ok',
      transport: summary.transport,
      userId: summary.userId,
    });
  }

  private logFailure(
    summary: RequestLogSummary,
    durationMs: number,
    error: unknown,
  ): void {
    this.logger.warn({
      durationMs: Math.round(durationMs),
      error: errorName(error),
      event: 'request_failed',
      operation: summary.operation,
      path: summary.path,
      status: 'error',
      transport: summary.transport,
      userId: summary.userId,
    });
  }
}

function requestSummaryFromContext(
  context: ExecutionContext,
): RequestLogSummary {
  if (context.getType<string>() === 'graphql') {
    const gqlContext = GqlExecutionContext.create(context);
    const request = gqlContext.getContext<{ req?: RequestLike }>().req;
    const info = gqlContext.getInfo<GraphQLResolveInfo>();

    return graphqlRequestLogSummary({ info, request });
  }

  const request = context.switchToHttp().getRequest<RequestLike>();
  return httpRequestLogSummary(request);
}

function errorName(error: unknown): string {
  if (error instanceof Error) {
    return error.name;
  }

  return 'UnknownError';
}
