import { Exclude } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UserDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;

  @IsOptional()
  createdAt?: Date;

  @IsOptional()
  updatedAt?: Date;

  @IsNotEmpty()
  @IsString()
  defaultLocation: string;

  @Exclude() // ✅ Ensures password is never exposed
  password?: string;
}
