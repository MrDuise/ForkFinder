import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { RegisterUserDto } from '../dto/register-user.dto';
import { UserDto } from '../dto/user.dto';
import { plainToInstance } from 'class-transformer';
import * as bcrypt from 'bcryptjs';
import { UserProfile } from '../dto/user-profile';
//import { validateOrReject } from 'class-validator';
import { UserPreferences } from '../entities/profile.entity';
import { ProfileRequest } from '../dto/updateProfileRequest';
import NodeGeocoder from 'node-geocoder';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(UserPreferences)
    private profileRepository: Repository<UserPreferences>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async findProfileById(userId: string): Promise<UserProfile | null> {
    return this.profileRepository.findOne({ where: { userId } });
  }

  async createUser(userDto: RegisterUserDto): Promise<UserDto> {
    const existingUser = await this.findByEmail(userDto.email);
    if (existingUser) {
      throw new BadRequestException('Email is already in use.');
    }

    const hashedPassword = await bcrypt.hash(userDto.password, 10);

    const user = this.userRepository.create({
      ...userDto,
      password: hashedPassword, // Ensure password is hashed before saving
    });

    const savedUser = await this.userRepository.save(user);
    return plainToInstance(UserDto, savedUser);
  }

  /*
  - used in user creation flow, also for whenever they want to update this info
  - allows the user to set the default info such a default location, a string coverted to a log/lat address
  - their default radius of how far they want to search out
  - deit restrictions - imported by the session for that user, so they only see that stuff
  - cuisine choices - also imported by the session for that user, not the entire group
  */
  async updateProfile(
    userID: string,
    updateProfile: ProfileRequest,
  ): Promise<UserProfile> {
    const existingProfile = await this.findProfileById(userID);
    const location: NodeGeocoder.Entry | undefined = await this.geocodeAddress(
      updateProfile.address!,
    );
    if (!location) {
      throw new Error('Could not geocode the given address.');
    }
    const userProfile: UserProfile = {
      userId: userID,
      defaultLocation: {
        address: updateProfile.address!,
        latitude: location.latitude!,
        longitude: location.longitude!,
      },
      defaultRadius: updateProfile?.defaultRadius,
      dietaryPreferences: updateProfile?.dietaryPreferences,
      cuisinePreferences: updateProfile?.cuisinePreferences,
    };

    const profileEntity = this.profileRepository.create({
      ...(existingProfile ?? {}),
      ...userProfile,
    });

    //TODO fix this
    //await validateOrReject(profileEntity); // throws if invalid

    return await this.profileRepository.save(profileEntity);
  }

  async geocodeAddress(address: string) {
    const geocoder = NodeGeocoder({
      provider: 'openstreetmap', // You can also use 'google', 'mapquest', etc.
    });
    try {
      const res = await geocoder.geocode(address);
      console.log(res);
      return res[0]; // Contains latitude, longitude, etc.
    } catch (error) {
      console.error('Geocoding error:', error);
    }
  }
}
