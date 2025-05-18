import { Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { RedisModule as NestRedisModule } from '@nestjs-modules/ioredis';

@Module({
  imports: [
    NestRedisModule.forRoot({
      config: {
        host: 'localhost', // Change if using Docker (e.g., 'redis' if named in docker-compose)
        port: 6379,
        password: '', // Set if needed
      },
    }),
  ],
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
