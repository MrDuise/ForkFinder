import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../modules/auth/entities/user.entity';
import { UserPreferences } from '../modules/auth/entities/profile.entity';

export const databaseConfig = registerAs(
  'database',
  (): TypeOrmModuleOptions => ({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT!) || 5432,
    username: process.env.DB_USERNAME || 'admin',
    password: process.env.DB_PASSWORD || 'postgres123',
    database: process.env.DB_NAME || 'ForkFinder',
    entities: [User, UserPreferences],
    synchronize: process.env.NODE_ENV !== 'production',
    logging: process.env.NODE_ENV === 'development',
    ssl:
      process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : false,
    migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
    autoLoadEntities: true,
  }),
);
