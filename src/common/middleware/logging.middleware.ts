import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction): void {
    const { method, originalUrl } = req;
    const startTime = Date.now();

    // Only log bodies for specific routes and non-GET requests
    const shouldLogBody = this.shouldLogRequestBody(method, originalUrl);

    if (shouldLogBody) {
      const sanitizedBody = this.sanitizeBody(req.body);
      this.logger.debug(`📤 [${method}] ${originalUrl}`, {
        body: sanitizedBody,
      });
    } else {
      this.logger.log(`📤 [${method}] ${originalUrl}`);
    }

    res.on('finish', () => {
      const { statusCode } = res;
      const duration = Date.now() - startTime;

      if (statusCode >= 400) {
        this.logger.error(
          `❌ [${method}] ${originalUrl} ${statusCode} - ${duration}ms`,
        );
      } else if (duration > 1000) {
        this.logger.warn(
          `🐌 [${method}] ${originalUrl} ${statusCode} - ${duration}ms (SLOW)`,
        );
      } else {
        this.logger.log(
          `✅ [${method}] ${originalUrl} ${statusCode} - ${duration}ms`,
        );
      }
    });

    next();
  }

  private shouldLogRequestBody(method: string, url: string): boolean {
    // Only log bodies for debugging specific routes
    if (method === 'GET') return false;
    if (url.includes('/auth/login')) return false; // Never log login attempts
    if (process.env.NODE_ENV === 'production') return false;
    return true;
  }

  private sanitizeBody(body: any): any {
    if (!body) return body;
    const sensitive = ['password', 'token', 'secret', 'key'];
    const sanitized = { ...body };

    sensitive.forEach((field) => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });

    return sanitized;
  }
}
