import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
  HttpException,
} from '@nestjs/common';
import { Observable, throwError, timer } from 'rxjs';
import { catchError, retryWhen, scan, delayWhen } from 'rxjs/operators';

@Injectable()
export class DatabaseRetryInterceptor implements NestInterceptor {
  private readonly logger = new Logger(DatabaseRetryInterceptor.name);
  private readonly maxRetries = 3;
  private readonly baseDelay = 1000; // 1 second

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      retryWhen((errors) =>
        errors.pipe(
          scan((retryCount, error) => {
            // Check if this is a retryable database error
            if (!this.isRetryableError(error)) {
              this.logger.debug(
                'Non-retryable error, not retrying:',
                error.message,
              );
              throw error;
            }

            if (retryCount >= this.maxRetries) {
              this.logger.error(
                `Database operation failed after ${this.maxRetries} retries`,
                error.message,
              );
              throw error;
            }

            const delay = this.baseDelay * Math.pow(2, retryCount); // Exponential backoff
            this.logger.warn(
              `Database operation failed, retrying in ${delay}ms (attempt ${retryCount + 1}/${this.maxRetries})`,
              error.message,
            );

            return retryCount + 1;
          }, 0),
          delayWhen((retryCount) =>
            timer(this.baseDelay * Math.pow(2, retryCount - 1)),
          ),
        ),
      ),
      catchError((error) => {
        return throwError(() => error);
      }),
    );
  }

  private isRetryableError(error: any): boolean {
    // Don't retry HTTP errors (business logic errors)
    if (error instanceof HttpException) {
      return false;
    }

    // Don't retry validation errors or other application errors
    if (error.name === 'ValidationError' || error.name === 'QueryFailedError') {
      // Check if it's a connection-related QueryFailedError
      const isConnectionError = this.isConnectionError(error);
      if (!isConnectionError) {
        return false;
      }
    }

    // Retry connection and timeout errors
    return this.isConnectionError(error);
  }

  private isConnectionError(error: any): boolean {
    const connectionErrors = [
      // Network errors
      'ECONNREFUSED',
      'ETIMEDOUT',
      'ENOTFOUND',
      'ENETUNREACH',
      'EHOSTUNREACH',

      // Database connection errors
      'connection terminated',
      'server closed the connection unexpectedly',
      'Connection lost',
      'connect ECONNREFUSED',
      'timeout expired',
      'server shutdown',

      // PostgreSQL specific
      'terminating connection due to administrator command',
      'the database system is shutting down',
      'connection to server',

      // MongoDB specific
      'MongoNetworkError',
      'MongoServerSelectionError',
      'connection timed out',
      'no primary found',

      // Redis specific
      'Redis connection lost',
      'Connection is closed',
    ];

    const errorMessage = error.message?.toLowerCase() || '';
    const errorCode = error.code?.toLowerCase() || '';

    return connectionErrors.some(
      (errorType) =>
        errorMessage.includes(errorType.toLowerCase()) ||
        errorCode.includes(errorType.toLowerCase()),
    );
  }
}
