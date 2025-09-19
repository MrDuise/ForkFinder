import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../modules/auth/entities/user.entity';
import { UserPreferences } from '../modules/auth/entities/profile.entity';

export const databaseConfig = registerAs(
  'database',
  (): TypeOrmModuleOptions => ({
    type: 'postgres',
    host: process.env.DB_HOST!,
    port: parseInt(process.env.DB_PORT!),
    username: process.env.DB_USERNAME!,
    password: process.env.DB_PASSWORD!,
    database: process.env.DB_NAME!,
    entities: [User, UserPreferences],
    synchronize: process.env.NODE_ENV !== 'production',
    logging: process.env.NODE_ENV === 'development',
    ssl:
      process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : false,
    migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
    autoLoadEntities: true,
    // retryAttempts: 5,
    // retryDelay: 3000, // 3 seconds

    // Connection pool and timeout settings for better resilience
    extra: {
      connectionTimeoutMillis: 10000, // 10 seconds
      idleTimeoutMillis: 30000, // 30 seconds
      max: 20, // max connections in pool
      statement_timeout: 30000, // 30 seconds for queries
      query_timeout: 30000,
    },
  }),
);
