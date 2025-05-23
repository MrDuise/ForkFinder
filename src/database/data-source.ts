// src/config/data-source.ts
import 'reflect-metadata';

import { DataSource } from 'typeorm';
import { User } from '../modules/auth/entities/user.entity';
import { UserPreferences } from '../modules/auth/entities/profile.entity';

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432') || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres123',
  database: process.env.DB_NAME || 'ForkFinder',
  entities: [User, UserPreferences],
  migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
  ssl:
    process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : false,
  synchronize: false,
});
