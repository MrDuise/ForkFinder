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
import { RestaurantSearchService } from './restaurant-search/restaurant-search.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, redisConfig],
      envFilePath: ['.env.local', '.env'],
    }),
    TypeOrmModule.forRootAsync({
      useFactory: databaseConfig,
    }),
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri:
          process.env.MONGODB_URI ||
          'mongodb://admin:password@localhost:27017/sessionDB?authSource=admin',
      }),
    }),
    AuthModule,
    SessionModule,
    RedisConfigModule,
  ],
  controllers: [AppController],
  providers: [AppService, RestaurantSearchService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
