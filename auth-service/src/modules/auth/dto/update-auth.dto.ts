import { PartialType } from '@nestjs/mapped-types';
import { IsString, IsOptional, IsEmail } from 'class-validator';
import { CreateUserDto } from './create-user-dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  defaultLocation?: string;

  @IsOptional()
  updatedAt?: Date;
}
