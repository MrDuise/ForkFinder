import { Injectable, OnModuleDestroy, Inject } from '@nestjs/common';
import { Redis } from 'ioredis';
import { InjectRedis } from '@nestjs-modules/ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  constructor(@InjectRedis() private readonly redisClient: Redis) {}

  async set(key: string, value: any, ttl?: number): Promise<void> {
    const stringValue = JSON.stringify(value);
    if (ttl) {
      await this.redisClient.set(key, stringValue, 'EX', ttl); // Expiry in seconds
    } else {
      await this.redisClient.set(key, stringValue);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    const data = await this.redisClient.get(key);
    return data ? JSON.parse(data) : null;
  }

  async delete(key: string): Promise<boolean> {
    return (await this.redisClient.del(key)) > 0;
  }

  async onModuleDestroy() {
    await this.redisClient.quit();
  }
}
