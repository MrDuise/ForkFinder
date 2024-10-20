import { MiddlewareConsumer, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../modules/auth/auth.module';
import { User } from '../modules/auth/entities/user.entity';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { LoggingMiddleware } from 'src/logging/logging.middleware';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres123',
      database: 'ForkFinder',
      entities: [User],
      synchronize: true, // Automatically syncs the schema, don't use in production
    }),
    AuthModule, // Import the AuthModule
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [AppController], // Root-level controller
  providers: [AppService], // Root-level service
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*'); // Apply the middleware to all routes
  }
}
