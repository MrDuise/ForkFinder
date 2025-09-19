import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { DatabaseHealthService } from './database-health.service';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: DatabaseHealthService,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.db.checkPostgres('postgres'),
      //() => this.db.checkMongo('mongodb'),
      //() => this.db.checkRedis('redis'),
    ]);
  }
}
