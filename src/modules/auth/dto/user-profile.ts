import {
  IsString,
  IsOptional,
  IsNumber,
  IsArray,
  ValidateNested,
  ArrayNotEmpty,
  ArrayUnique,
} from 'class-validator';
import { Type } from 'class-transformer';

export class Location {
  @IsString()
  address: string;

  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;
}

export class UserProfile {
  @IsOptional()
  @IsString()
  userId: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => Location)
  defaultLocation?: Location;

  @IsOptional()
  @IsNumber()
  defaultRadius?: number;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsString({ each: true })
  dietaryPreferences?: string[];

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsString({ each: true })
  cuisinePreferences?: string[];
}
