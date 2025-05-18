import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../services/user.service';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

describe('AuthService', () => {
  let authService: AuthService;
  let userService: UserService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            findByEmail: jest.fn(),
            createUser: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('validateUser', () => {
    it('should return user data without password if user is valid', async () => {
      const mockUser = {
        id: '7f9b79c2-9ad7-4c43-b8e9-3f19e3ef901e',
        firstName: 'John',
        lastName: 'Doe',
        email: 'testuser@example.com',
        password: await bcrypt.hash('testpass', 10), // Hashed password
        phoneNumber: '123456789',
        defaultLocation: 'New York',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(userService, 'findByEmail').mockResolvedValue(mockUser);
      const bcryptCompare = jest.fn().mockResolvedValue(true);
      (bcrypt.compare as jest.Mock) = bcryptCompare;

      const result = await authService.validateUser(
        'testuser@example.com',
        'testpass',
      );

      expect(result).toEqual({
        id: mockUser.id,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        email: mockUser.email,
        phoneNumber: mockUser.phoneNumber,
        defaultLocation: mockUser.defaultLocation,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });
    });

    it('should throw UnauthorizedException if user is not found', async () => {
      jest.spyOn(userService, 'findByEmail').mockResolvedValue(null);

      await expect(
        authService.validateUser('invaliduser@example.com', 'testpass'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password is incorrect', async () => {
      const mockUser = {
        id: '7f9b79c2-9ad7-4c43-b8e9-3f19e3ef901e',
        firstName: 'John',
        lastName: 'Doe',
        email: 'testuser@example.com',
        password: await bcrypt.hash('testpass', 10), // Hashed password
        phoneNumber: '123456789',
        defaultLocation: 'New York',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(userService, 'findByEmail').mockResolvedValue(mockUser);
      const bcryptCompare = jest.fn().mockResolvedValue(false);
      (bcrypt.compare as jest.Mock) = bcryptCompare;

      await expect(
        authService.validateUser('testuser@example.com', 'wrongpass'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('login', () => {
    it('should return a JWT token', async () => {
      const token = 'test-jwt-token';

      jest.spyOn(jwtService, 'sign').mockReturnValue(token);

      const result = await authService.login(
        'testuser@example.com',
        'password',
      );

      expect(result).toEqual({ accessToken: token });
    });
  });
});
