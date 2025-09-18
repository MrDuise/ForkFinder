// src/config/env.validation.ts
import { plainToClass, Transform } from 'class-transformer';
import { IsString, IsNumber, validateSync } from 'class-validator';

export class EnvironmentVariables {
  //General App Settings
  @IsString()
  NODE_ENV: string;

  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  PORT: number;

  @IsString()
  ALLOWED_ORIGINS: string;

  //Database (postgres)
  @IsString()
  DB_HOST: string;

  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  DB_PORT: number;

  @IsString()
  DB_USERNAME: string;

  @IsString()
  DB_PASSWORD: string;

  //Secret keys and API keys
  @IsString()
  JWT_SECRET: string;

  @IsString()
  JWT_EXPIRES_IN: string;

  @IsString()
  JWT_REFRESH_SECRET: string;

  @IsString()
  JWT_ISSUER: string;

  @IsString()
  JWT_AUDIENCE: string;

  @IsString()
  GOOGLE_MAPS_API_KEY: string;

  //MongoDB (for sessions)
  @IsString()
  MONGODB_URI: string;

  @IsString()
  REDIS_HOST: string = 'localhost';

  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  REDIS_PORT: number;

  @IsString()
  REDIS_PASSWORD: string = '';

  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  REDIS_DB: number;

  @IsString()
  REDIS_KEY_PREFIX: string;
}

export function validateConfig(config: Record<string, unknown>) {
  const validatedConfig = plainToClass(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(`Config validation error: ${errors.toString()}`);
  }
  return validatedConfig;
}
