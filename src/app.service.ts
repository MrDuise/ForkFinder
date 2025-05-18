import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'ForkFinder API - Monolithic Service Running!';
  }

  getVersion(): string {
    return process.env.npm_package_version || '1.0.0';
  }

  getEnvironment(): string {
    return process.env.NODE_ENV || 'development';
  }

  getUptime(): number {
    return process.uptime();
  }
}
