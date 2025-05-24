// src/modules/auth/controllers/auth.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { RegisterUserDto } from '../dto/register-user.dto';
import { UserDto } from '../dto/user.dto';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;
  let userService: jest.Mocked<UserService>;

  const mockUserDto: UserDto = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phoneNumber: '1234567890',
    defaultLocation: '123 Main St',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  };

  const mockRegisterDto: RegisterUserDto = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phoneNumber: '1234567890',
    defaultLocation: '123 Main St',
    password: 'plainPassword123',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn(),
            validateUser: jest.fn(),
          },
        },
        {
          provide: UserService,
          useValue: {
            createUser: jest.fn(),
            findByEmail: jest.fn(),
            findById: jest.fn(),
            findProfileById: jest.fn(),
            updateProfile: jest.fn(),
            geocodeAddress: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
    userService = module.get(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      userService.createUser.mockResolvedValue(mockUserDto);

      const result = await controller.register(mockRegisterDto);

      expect(userService.createUser).toHaveBeenCalledWith(mockRegisterDto);
      expect(result).toEqual(mockUserDto);
    });

    it('should handle registration with minimal required fields', async () => {
      const minimalDto: RegisterUserDto = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane.doe@example.com',
        defaultLocation: 'New York',
        password: 'password123',
      };

      const expectedUser: UserDto = {
        id: minimalDto.id,
        firstName: minimalDto.firstName,
        lastName: minimalDto.lastName,
        email: minimalDto.email,
        phoneNumber: '', // Optional field
        defaultLocation: minimalDto.defaultLocation,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      userService.createUser.mockResolvedValue(expectedUser);

      const result = await controller.register(minimalDto);

      expect(userService.createUser).toHaveBeenCalledWith(minimalDto);
      expect(result).toEqual(expectedUser);
    });

    it('should throw BadRequestException when email already exists', async () => {
      userService.createUser.mockRejectedValue(
        new BadRequestException('Email is already in use.'),
      );

      await expect(controller.register(mockRegisterDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(controller.register(mockRegisterDto)).rejects.toThrow(
        'Email is already in use.',
      );

      expect(userService.createUser).toHaveBeenCalledWith(mockRegisterDto);
    });

    it('should handle service errors during registration', async () => {
      userService.createUser.mockRejectedValue(
        new Error('Database connection failed'),
      );

      await expect(controller.register(mockRegisterDto)).rejects.toThrow(
        'Database connection failed',
      );
    });

    it('should handle registration with all optional fields', async () => {
      const fullDto: RegisterUserDto = {
        ...mockRegisterDto,
        phoneNumber: '+1-555-123-4567',
      };

      const fullUserDto: UserDto = {
        ...mockUserDto,
        phoneNumber: '+1-555-123-4567',
      };

      userService.createUser.mockResolvedValue(fullUserDto);

      const result = await controller.register(fullDto);

      expect(userService.createUser).toHaveBeenCalledWith(fullDto);
      expect(result).toEqual(fullUserDto);
      expect(result.phoneNumber).toBe('+1-555-123-4567');
    });
  });

  describe('login', () => {
    const email = 'john.doe@example.com';
    const password = 'plainPassword123';
    const mockAccessToken = 'mock-jwt-token-12345';

    it('should successfully login with valid credentials', async () => {
      const expectedResponse = { accessToken: mockAccessToken };
      authService.login.mockResolvedValue(expectedResponse);

      const result = await controller.login(email, password);

      expect(authService.login).toHaveBeenCalledWith(email, password);
      expect(result).toEqual(expectedResponse);
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      authService.login.mockRejectedValue(
        new UnauthorizedException('Invalid credentials'),
      );

      await expect(controller.login(email, 'wrongPassword')).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(controller.login(email, 'wrongPassword')).rejects.toThrow(
        'Invalid credentials',
      );

      expect(authService.login).toHaveBeenCalledWith(email, 'wrongPassword');
    });

    it('should handle empty email or password', async () => {
      authService.login.mockRejectedValue(
        new UnauthorizedException('Invalid credentials'),
      );

      await expect(controller.login('', password)).rejects.toThrow(
        UnauthorizedException,
      );

      await expect(controller.login(email, '')).rejects.toThrow(
        UnauthorizedException,
      );

      expect(authService.login).toHaveBeenCalledWith('', password);
      expect(authService.login).toHaveBeenCalledWith(email, '');
    });

    // it('should handle service errors during login', async () => {
    //   authService.login.mockRejectedValue(new Error('JWT service unavailable'));

    //   await expect(controller.login(email, password)).rejects.toThrow
  });
});
