// src/modules/auth/services/user.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UserService } from './user.service';
import { User } from '../entities/user.entity';
import { UserPreferences } from '../entities/profile.entity';
import { RegisterUserDto } from '../dto/register-user.dto';
import { ProfileRequest } from '../dto/updateProfileRequest';

import { UserDto } from '../dto/user.dto';

// Mock NodeGeocoder
jest.mock('node-geocoder', () => {
  return jest.fn(() => ({
    geocode: jest.fn(),
  }));
});

describe('UserService', () => {
  let service: UserService;
  let userRepository: jest.Mocked<Repository<User>>;
  let profileRepository: jest.Mocked<Repository<UserPreferences>>;

  const mockUser: User = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    password: 'hashedPassword123',
    phoneNumber: '1234567890',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  };

  const mockUserPreferences: UserPreferences = {
    userId: '123e4567-e89b-12d3-a456-426614174000',
    user: mockUser,
    defaultLocation: {
      address: '123 Main St, New York, NY',
      latitude: 40.7128,
      longitude: -74.006,
    },
    defaultRadius: 5,
    dietaryPreferences: ['vegetarian', 'gluten-free'],
    cuisinePreferences: ['italian', 'mexican'],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(UserPreferences),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get(getRepositoryToken(User));
    profileRepository = module.get(getRepositoryToken(UserPreferences));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findByEmail', () => {
    it('should return a user when found', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByEmail('john.doe@example.com');

      expect(result).toEqual(mockUser);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'john.doe@example.com' },
      });
    });

    it('should return null when user not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      const result = await service.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'nonexistent@example.com' },
      });
    });
  });

  describe('findById', () => {
    it('should return a user when found', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findById(
        '123e4567-e89b-12d3-a456-426614174000',
      );

      expect(result).toEqual(mockUser);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: '123e4567-e89b-12d3-a456-426614174000' },
      });
    });

    it('should return null when user not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      const result = await service.findById('nonexistent-id');

      expect(result).toBeNull();
    });
  });

  describe('findProfileById', () => {
    it('should return user profile when found', async () => {
      profileRepository.findOne.mockResolvedValue(mockUserPreferences);

      const result = await service.findProfileById(
        '123e4567-e89b-12d3-a456-426614174000',
      );

      expect(result).toEqual(mockUserPreferences);
      expect(profileRepository.findOne).toHaveBeenCalledWith({
        where: { userId: '123e4567-e89b-12d3-a456-426614174000' },
      });
    });

    it('should return null when profile not found', async () => {
      profileRepository.findOne.mockResolvedValue(null);

      const result = await service.findProfileById('nonexistent-id');

      expect(result).toBeNull();
    });
  });

  describe('createUser', () => {
    const registerDto: RegisterUserDto = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phoneNumber: '1234567890',
      defaultLocation: '123 Main St',
      password: 'plainPassword123',
    };

    it('should create a new user successfully', async () => {
      userRepository.findOne.mockResolvedValue(null); // No existing user
      const hashedPassword = 'hashedPassword123';
      jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword as never);

      const createdUser = { ...mockUser, password: hashedPassword };
      userRepository.create.mockReturnValue(createdUser);
      userRepository.save.mockResolvedValue(createdUser);

      const result = await service.createUser(registerDto);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
      expect(userRepository.create).toHaveBeenCalledWith({
        ...registerDto,
        password: hashedPassword,
      });
      expect(userRepository.save).toHaveBeenCalledWith(createdUser);
      expect(result).toBeInstanceOf(UserDto);
      expect(result.email).toBe(registerDto.email);
    });

    it('should throw BadRequestException when email already exists', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);

      await expect(service.createUser(registerDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.createUser(registerDto)).rejects.toThrow(
        'Email is already in use.',
      );
    });

    // it('should handle bcrypt hashing error', async () => {
    //   userRepository.findOne.mockResolvedValue(null);
    //   jest.spyOn(bcrypt, 'hash').mockRejectedValue(new Error('Hashing failed'));

    //   await expect(service.createUser(registerDto)).rejects.toThrow(
    //     'Hashing failed',
    //   );
    // });
  });

  describe('updateProfile', () => {
    const profileRequest: ProfileRequest = {
      address: '456 Oak St, Los Angeles, CA',
      defaultRadius: 10,
      dietaryPreferences: ['vegan'],
      cuisinePreferences: ['asian', 'mediterranean'],
    };

    beforeEach(() => {
      // Mock geocodeAddress method
      jest.spyOn(service, 'geocodeAddress').mockResolvedValue({
        latitude: 34.0522,
        longitude: -118.2437,
        formattedAddress: '456 Oak St, Los Angeles, CA',
      } as any);
    });

    it('should update existing profile successfully', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      profileRepository.findOne.mockResolvedValue(mockUserPreferences);

      const updatedProfile = {
        ...mockUserPreferences,
        defaultLocation: {
          address: profileRequest.address,
          latitude: 34.0522,
          longitude: -118.2437,
        },
        defaultRadius: profileRequest.defaultRadius,
        dietaryPreferences: profileRequest.dietaryPreferences,
        cuisinePreferences: profileRequest.cuisinePreferences,
      };

      profileRepository.create.mockReturnValue(updatedProfile);
      profileRepository.save.mockResolvedValue(updatedProfile);

      const result = await service.updateProfile(userId, profileRequest);

      expect(service.geocodeAddress).toHaveBeenCalledWith(
        profileRequest.address,
      );
      expect(profileRepository.findOne).toHaveBeenCalledWith({
        where: { userId },
      });
      expect(profileRepository.save).toHaveBeenCalledWith(updatedProfile);
      expect(result.defaultLocation?.address).toBe(profileRequest.address);
      expect(result.defaultRadius).toBe(profileRequest.defaultRadius);
    });

    it('should create new profile when none exists', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      profileRepository.findOne.mockResolvedValue(null);

      const newProfile = {
        userId,
        defaultLocation: {
          address: profileRequest.address,
          latitude: 34.0522,
          longitude: -118.2437,
        },
        defaultRadius: profileRequest.defaultRadius,
        dietaryPreferences: profileRequest.dietaryPreferences,
        cuisinePreferences: profileRequest.cuisinePreferences,
      } as UserPreferences;

      profileRepository.create.mockReturnValue(newProfile);
      profileRepository.save.mockResolvedValue(newProfile);

      const result = await service.updateProfile(userId, profileRequest);

      expect(profileRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId,
          defaultLocation: expect.objectContaining({
            address: profileRequest.address,
            latitude: 34.0522,
            longitude: -118.2437,
          }),
        }),
      );
      expect(result).toEqual(newProfile);
    });

    it('should throw error when geocoding fails', async () => {
      jest.spyOn(service, 'geocodeAddress').mockResolvedValue(undefined);

      await expect(
        service.updateProfile('user-id', profileRequest),
      ).rejects.toThrow('Could not geocode the given address.');
    });
  });

  //   describe('geocodeAddress', () => {
  //     it('should return geocoding result successfully', async () => {
  //       const mockGeocoder = {
  //         geocode: jest.fn().mockResolvedValue([
  //           {
  //             latitude: 40.7128,
  //             longitude: -74.006,
  //             formattedAddress: 'New York, NY, USA',
  //           },
  //         ]),
  //       };

  //       // Mock the NodeGeocoder constructor
  //       // eslint-disable-next-line @typescript-eslint/no-require-imports
  //       const NodeGeocoder = require('node-geocoder');
  //       NodeGeocoder.mockReturnValue(mockGeocoder);

  //       const result = await service.geocodeAddress('New York, NY');

  //       expect(result).toEqual({
  //         latitude: 40.7128,
  //         longitude: -74.006,
  //         formattedAddress: 'New York, NY, USA',
  //       });
  //       expect(mockGeocoder.geocode).toHaveBeenCalledWith('New York, NY');
  //     });

  //     it('should handle geocoding error', async () => {
  //       const mockGeocoder = {
  //         geocode: jest.fn().mockRejectedValue(new Error('Geocoding failed')),
  //       };

  //       // eslint-disable-next-line @typescript-eslint/no-require-imports
  //       const NodeGeocoder = require('node-geocoder');
  //       NodeGeocoder.mockReturnValue(mockGeocoder);

  //       // Mock console.error to avoid noise in test output
  //       const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

  //       const result = await service.geocodeAddress('Invalid Address');

  //       expect(result).toBeUndefined();
  //       expect(consoleSpy).toHaveBeenCalledWith(
  //         'Geocoding error:',
  //         expect.any(Error),
  //       );

  //       consoleSpy.mockRestore();
  //     });
  //   });
});
