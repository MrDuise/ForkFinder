import {
  IsString,
  IsOptional,
  IsNumber,
  IsArray,
  ArrayUnique,
} from 'class-validator';

export class ProfileRequest {
  @IsString()
  address: string;

  @IsOptional()
  @IsNumber()
  defaultRadius?: number;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  dietaryPreferences?: string[];

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  cuisinePreferences?: string[];
}
