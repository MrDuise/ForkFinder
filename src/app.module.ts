import { Module, MiddlewareConsumer } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { SessionModule } from './modules/session/session.module';
import { RedisConfigModule } from './modules/redis/redis.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggingMiddleware } from './common/middleware/logging.middleware';
import { databaseConfig } from './config/database.config';
import { redisConfig } from './config/redis.config';
import { RestaurantSearchModule } from './restaurant-search/restaurant-search.module';
import { validateConfig } from './config/env.validation';

import { jwtConfig, mongoConfig } from './config';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateConfig,
      load: [databaseConfig, redisConfig, mongoConfig, jwtConfig],
      envFilePath: ['.env.local', '.env'],
    }),
    TypeOrmModule.forRootAsync({
      useFactory: databaseConfig,
    }),
    MongooseModule.forRootAsync({
      useFactory: mongoConfig,
    }),
    AuthModule,
    SessionModule,
    RedisConfigModule,
    RestaurantSearchModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
