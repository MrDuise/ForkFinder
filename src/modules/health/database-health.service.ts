import { Injectable, Logger } from '@nestjs/common';
import {
  HealthIndicatorService,
  HealthIndicatorResult,
} from '@nestjs/terminus';
import { InjectDataSource } from '@nestjs/typeorm';
import { InjectConnection as InjectMongoConnection } from '@nestjs/mongoose';
import { DataSource } from 'typeorm';
import { Connection as MongoConnection } from 'mongoose';
import Redis from 'ioredis';
import { InjectRedis } from '@nestjs-modules/ioredis';

@Injectable()
export class DatabaseHealthService {
  private readonly logger = new Logger('HTTP')

  constructor(
    private readonly healthIndicatorService: HealthIndicatorService,
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectMongoConnection() private readonly mongoConnection: MongoConnection,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  async checkPostgres(key: string): Promise<HealthIndicatorResult> {
    const indicator = this.healthIndicatorService.check(key);

    try {
      await this.dataSource.query('SELECT 1');
      this.logger.log('✅ PostgreSQL health check passed');
      return indicator.up();
    } catch (error) {
      this.logger.error('❌ PostgreSQL health check failed', error.message);
      return indicator.down({ error: error.message });
    }
  }

  async checkMongo(key: string): Promise<HealthIndicatorResult> {
    const indicator = this.healthIndicatorService.check(key);

    try {
      const state = this.mongoConnection.readyState;
      if (state === 1) {
        this.logger.log('✅ MongoDB health check passed');
        return indicator.up({ state });
      }

      const errorMsg = `MongoDB not ready, state: ${state}`;
      this.logger.error('❌ MongoDB health check failed', errorMsg);
      return indicator.down({ state, error: errorMsg });
    } catch (error) {
      this.logger.error('❌ MongoDB health check failed', error.message);
      return indicator.down({ error: error.message });
    }
  }

  async checkRedis(key: string): Promise<HealthIndicatorResult> {
    const indicator = this.healthIndicatorService.check(key);

    try {
      const result = await this.redis.ping();
      this.logger.log('✅ Redis health check passed');
      return indicator.up({ ping: result });
    } catch (error) {
      this.logger.error('❌ Redis health check failed', error.message);
      return indicator.down({ error: error.message });
    }
  }
}
