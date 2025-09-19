import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
import { HealthController } from './database-health.controller';
import { DatabaseHealthService } from './database-health.service';

@Module({
  imports: [
    TerminusModule,
    HttpModule, // Required for HTTP health checks
  ],
  providers: [DatabaseHealthService],
  controllers: [HealthController],
})
export class HealthModule {}
