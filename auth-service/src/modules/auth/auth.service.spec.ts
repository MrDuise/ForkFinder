import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity'; // Example User entity
import { Repository } from 'typeorm';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs'; // Import bcrypt for mocking

describe('AuthService', () => {
  let authService: AuthService;
  let userRepository: Repository<User>;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User), // Mock the userRepository
          useValue: {
            findOne: jest.fn(), // Mock the repository methods
            save: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(), // Mock JwtService sign method
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('validateUser', () => {
    it('should return user data without password if user is valid', async () => {
      const mockUser = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'testuser@example.com',
        password: 'testpass',
        phoneNumber: '123456789',
        defaultLocation: 'New York',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);
      const bcryptCompare = jest.fn().mockResolvedValue(true);
      (bcrypt.compare as jest.Mock) = bcryptCompare;

      const result = await authService.validateUser(
        'testuser@example.com',
        'testpass',
      );

      expect(result).toEqual({
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'testuser@example.com',
        phoneNumber: '123456789',
        defaultLocation: 'New York',
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });
    });

    it('should return UnauthorizedException if user is not valid', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(
        authService.validateUser('invaliduser', 'testpass'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return UnauthorizedException if password is incorrect', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(
        authService.validateUser('testuser@example.com', 'testpass'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('login', () => {
    it('should return a JWT token', async () => {
      const user = { username: 'testuser', userId: 1 };
      const token = 'testtoken';
      jest.spyOn(jwtService, 'signAsync').mockResolvedValue(token);

      const result = await authService.login(user);

      expect(result).toEqual({ accessToken: token });
    });
  });
});
