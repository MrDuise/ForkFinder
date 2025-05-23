import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { GlobalExceptionFilter } from './common/middleware/http-exception.middleware';

// Load environment variables
dotenv.config();

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  try {
    const app = await NestFactory.create(AppModule, {
      logger: ['log', 'error', 'warn', 'debug', 'verbose'], // Enables all levels
    });

    app.useGlobalFilters(new GlobalExceptionFilter());

    // Global pipes for validation
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        disableErrorMessages: false,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    // Enable CORS for frontend integration
    app.enableCors({
      origin: process.env.ALLOWED_ORIGINS?.split(',') || [
        'http://localhost:3000',
      ],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    });

    // Set global prefix for all routes
    app.setGlobalPrefix('api/v1');

    const port = process.env.PORT || 3000;
    await app.listen(port);

    logger.log(`Application is running on: http://localhost:${port}`);
    logger.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.log(`Global API prefix: /api/v1`);
  } catch (error) {
    logger.error('Error during application startup', error);
    process.exit(1);
  }
}

bootstrap();
