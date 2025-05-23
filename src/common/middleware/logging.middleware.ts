import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction): void {
    const { method, originalUrl, body } = req;
    const userAgent = req.get('user-agent') || '';
    const startTime = Date.now();

    // Remove sensitive data like password
    const sanitizedBody = { ...body };
    if (sanitizedBody.password) {
      sanitizedBody.password = '[REDACTED]';
    }

    this.logger.log(
      `[${method}] ${originalUrl} - User Agent: ${userAgent} - Body: ${JSON.stringify(sanitizedBody)}`,
    );

    res.on('finish', () => {
      const { statusCode } = res;
      const contentLength = res.get('content-length');
      const duration = Date.now() - startTime;

      // Log the response details
      this.logger.log(
        `[${method}] ${originalUrl} ${statusCode} - ${contentLength}b - ${duration}ms - User Agent: ${userAgent}`,
      );
    });

    next();
  }
}
