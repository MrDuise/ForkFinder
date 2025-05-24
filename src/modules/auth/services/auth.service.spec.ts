// src/modules/auth/services/auth.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { UserService } from './user.service';
import { User } from '../entities/user.entity';

describe('AuthService', () => {
  let authService: AuthService;
  let userService: jest.Mocked<UserService>;
  let jwtService: jest.Mocked<JwtService>;

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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            findByEmail: jest.fn(),
            findById: jest.fn(),
            createUser: jest.fn(),
            findProfileById: jest.fn(),
            updateProfile: jest.fn(),
            geocodeAddress: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            signAsync: jest.fn(),
            verify: jest.fn(),
            verifyAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get(UserService);
    jwtService = module.get(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    const email = 'john.doe@example.com';
    const password = 'plainPassword123';

    it('should return user when credentials are valid', async () => {
      userService.findByEmail.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      const result = await authService.validateUser(email, password);

      expect(userService.findByEmail).toHaveBeenCalledWith(email);
      expect(bcrypt.compare).toHaveBeenCalledWith(password, mockUser.password);
      expect(result).toEqual(mockUser);
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      userService.findByEmail.mockResolvedValue(null);

      await expect(authService.validateUser(email, password)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(authService.validateUser(email, password)).rejects.toThrow(
        'Invalid credentials',
      );

      expect(userService.findByEmail).toHaveBeenCalledWith(email);
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when password is incorrect', async () => {
      userService.findByEmail.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      await expect(authService.validateUser(email, password)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(authService.validateUser(email, password)).rejects.toThrow(
        'Invalid credentials',
      );

      expect(userService.findByEmail).toHaveBeenCalledWith(email);
      expect(bcrypt.compare).toHaveBeenCalledWith(password, mockUser.password);
    });

    // it('should throw UnauthorizedException when bcrypt.compare throws error', async () => {
    //   userService.findByEmail.mockResolvedValue(mockUser);
    //   jest.spyOn(bcrypt, 'compare').mockRejectedValue(new Error('Bcrypt error'));

    //   await expect(authService.validateUser(email, password)).rejects.toThrow(
    //     UnauthorizedException,
    //   );
    //   await expect(authService.validateUser(email, password)).rejects.toThrow(
    //     'Invalid credentials',
    //   );
    // });

    it('should handle user service errors gracefully', async () => {
      userService.findByEmail.mockRejectedValue(new Error('Database error'));

      await expect(authService.validateUser(email, password)).rejects.toThrow(
        'Database error',
      );
    });
  });

  describe('login', () => {
    const email = 'john.doe@example.com';
    const password = 'plainPassword123';
    const mockToken = 'mock-jwt-token-12345';

    it('should return access token when login is successful', async () => {
      // Mock validateUser to return user
      jest.spyOn(authService, 'validateUser').mockResolvedValue(mockUser);
      jwtService.sign.mockReturnValue(mockToken);

      const result = await authService.login(email, password);

      expect(authService.validateUser).toHaveBeenCalledWith(email, password);
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
      });
      expect(result).toEqual({
        accessToken: mockToken,
      });
    });

    it('should throw UnauthorizedException when validateUser fails', async () => {
      jest
        .spyOn(authService, 'validateUser')
        .mockRejectedValue(new UnauthorizedException('Invalid credentials'));

      await expect(authService.login(email, password)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(authService.login(email, password)).rejects.toThrow(
        'Invalid credentials',
      );

      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it('should handle JWT service errors', async () => {
      jest.spyOn(authService, 'validateUser').mockResolvedValue(mockUser);
      jwtService.sign.mockImplementation(() => {
        throw new Error('JWT signing error');
      });

      await expect(authService.login(email, password)).rejects.toThrow(
        'JWT signing error',
      );
    });

    it('should create correct JWT payload with user id and email', async () => {
      const customUser = {
        ...mockUser,
        id: 'custom-user-id',
        email: 'custom@example.com',
      };

      jest.spyOn(authService, 'validateUser').mockResolvedValue(customUser);
      jwtService.sign.mockReturnValue(mockToken);

      await authService.login(email, password);

      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: 'custom-user-id',
        email: 'custom@example.com',
      });
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle undefined or null password in validateUser', async () => {
      userService.findByEmail.mockResolvedValue({
        ...mockUser,
        password: undefined as any,
      });

      await expect(
        authService.validateUser('test@example.com', 'password'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should handle empty string inputs', async () => {
      await expect(authService.validateUser('', '')).rejects.toThrow(
        UnauthorizedException,
      );

      expect(userService.findByEmail).toHaveBeenCalledWith('');
    });

    it('should handle very long email and password', async () => {
      const longEmail = 'a'.repeat(1000) + '@example.com';
      const longPassword = 'b'.repeat(1000);

      userService.findByEmail.mockResolvedValue(null);

      await expect(
        authService.validateUser(longEmail, longPassword),
      ).rejects.toThrow(UnauthorizedException);

      expect(userService.findByEmail).toHaveBeenCalledWith(longEmail);
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete login flow with real-world data', async () => {
      const realUser = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@company.com',
        password:
          '$2a$10$N9qo8uLOickgx2ZMRZoMye.IjZP.VWSm5J1z.IXQG2I8VgW6mKVeq', // hashed "password123"
        phoneNumber: '+1-555-123-4567',
        createdAt: new Date('2023-12-01T10:30:00Z'),
        updatedAt: new Date('2023-12-15T14:20:00Z'),
      };

      const expectedToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

      userService.findByEmail.mockResolvedValue(realUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      jwtService.sign.mockReturnValue(expectedToken);

      const result = await authService.login(realUser.email, 'password123');

      expect(result).toEqual({
        accessToken: expectedToken,
      });
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: realUser.id,
        email: realUser.email,
      });
    });
  });
});
