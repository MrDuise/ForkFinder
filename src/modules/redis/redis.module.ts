import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisModule } from '@nestjs-modules/ioredis';
import { redisConfig } from '../../config/redis.config'; // Adjust path as needed
import { RedisService } from './redis.service'; // Adjust path as needed

@Module({
  imports: [
    ConfigModule.forFeature(redisConfig),
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const redis = configService.get('redis')!;

        // Build Redis URL from config
        const passwordPart = redis.password
          ? `:${encodeURIComponent(redis.password)}@`
          : '';
        const url = `redis://${passwordPart}${redis.host}:${redis.port}`;

        return {
          type: 'single',
          url,
          options: {
            db: redis.db,
            keyPrefix: redis.keyPrefix,
            retryDelayOnFailover: redis.retryDelayOnFailover,
            enableReadyCheck: redis.enableReadyCheck,
            maxRetriesPerRequest: redis.maxRetriesPerRequest,
            lazyConnect: redis.lazyConnect,
            family: redis.family,
            keepAlive: redis.keepAlive,
            connectTimeout: redis.connectTimeout,
          },
        };
      },
    }),
  ],
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisConfigModule {}