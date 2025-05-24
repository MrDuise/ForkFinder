import { IsString, IsNumber, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

// DTO for GroupSettings
class GroupSettingsDTO {
  @IsNumber()
  maxGroupSize: number;

  @IsString()
  notificationPreferences: string;

  @IsNumber()
  timeLimit: number;
}

// DTO for Location
class LocationDTO {
  @IsNumber()
  lat: number;

  @IsNumber()
  lng: number;

  @IsNumber()
  radius: number;
}

// DTO for Creating a Session
export class CreateSessionDto {
  @ValidateNested()
  @Type(() => LocationDTO)
  location: LocationDTO;

  @ValidateNested()
  @Type(() => GroupSettingsDTO)
  settings: GroupSettingsDTO;
}
