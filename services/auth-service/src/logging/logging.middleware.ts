import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction): void {
    const { method, originalUrl, body } = req;
    const userAgent = req.get('user-agent') || '';

    // Remove sensitive data like password
    const sanitizedBody = { ...body };
    if (sanitizedBody.password) {
      sanitizedBody.password = '[REDACTED]';
    }

    this.logger.log(
      `[AuthService] Request - ${method} ${originalUrl} - User Agent: ${userAgent} - Body: ${JSON.stringify(sanitizedBody)}`,
    );

    res.on('finish', () => {
      const { statusCode } = res;
      const contentLength = res.get('content-length');

      // Log the response details (usually doesn't contain sensitive info)
      this.logger.log(
        `[AuthService] Response - ${method} ${originalUrl} ${statusCode} - ${contentLength}b sent - User Agent: ${userAgent}`,
      );
    });

    next();
  }
}
