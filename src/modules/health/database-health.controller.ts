import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { DatabaseHealthService } from './database-health.service';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'typeorm';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    @InjectConnection()
    private readonly postgresConnection: Connection,
    private readonly databaseHealthService: DatabaseHealthService,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () =>
        this.db.pingCheck('postgres', { connection: this.postgresConnection }),
      //() => this.db.checkMongo('mongodb'),
      //() => this.db.checkRedis('redis'),
    ]);
  }
}
