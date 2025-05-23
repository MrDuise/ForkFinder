import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisModule } from '@nestjs-modules/ioredis';
import { redisConfig } from '../../config/redis.config'; // Adjust path if needed

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [redisConfig],
    }),
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const redis = configService.get('redis')!;

        // Build Redis URL from config like before
        const passwordPart = redis.password
          ? `:${encodeURIComponent(redis.password)}@`
          : '';
        const url = `redis://${passwordPart}${redis.host}:${redis.port}`;

        return {
          type: 'single',
          url,
          db: redis.db,
          keyPrefix: redis.keyPrefix,
          retryDelayOnFailover: redis.retryDelayOnFailover,
          enableReadyCheck: redis.enableReadyCheck,
          maxRetriesPerRequest: redis.maxRetriesPerRequest,
          lazyConnect: redis.lazyConnect,
          family: redis.family,
          keepAlive: redis.keepAlive,
          connectTimeout: redis.connectTimeout,
        };
      },
    }),
  ],
})
export class RedisConfigModule {}
