// import { Test, TestingModule } from '@nestjs/testing';
// import { UserService } from './user.service';
// import { getRepositoryToken } from '@nestjs/typeorm';
// import { User } from '../entities/user.entity';
// import { Repository } from 'typeorm';
// import * as bcrypt from 'bcryptjs';
// import { UserDto } from '../dto/user.dto';

// describe('UserService', () => {
//   let userService: UserService;
//   let userRepository: Repository<User>;

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [
//         UserService,
//         {
//           provide: getRepositoryToken(User),
//           useValue: {
//             findOne: jest.fn(),
//             save: jest.fn(),
//             create: jest.fn(),
//           },
//         },
//       ],
//     }).compile();

//     userService = module.get<UserService>(UserService);
//     userRepository = module.get<Repository<User>>(getRepositoryToken(User));
//   });

//   describe('findByEmail', () => {
//     it('should return user if found', async () => {
//       const mockUser = {
//         id: 1,
//         firstName: 'John',
//         lastName: 'Doe',
//         email: 'testuser@example.com',
//         password: await bcrypt.hash('testpass', 10), // Hashed password
//         phoneNumber: '123456789',
//         defaultLocation: 'New York',
//         createdAt: new Date(),
//         updatedAt: new Date(),
//       };

//       jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);

//       const result = await userService.findByEmail('testuser@example.com');

//       expect(result).toEqual(mockUser);
//     });

//     it('should return null if user is not found', async () => {
//       jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

//       const result = await userService.findByEmail('notfound@example.com');

//       expect(result).toBeNull();
//     });
//   });

//   describe('createUser', () => {
//     it('should create and return a new user with hashed password', async () => {
//       const mockUserDto = {
//         id: 1,
//         firstName: 'John',
//         lastName: 'Doe',
//         email: 'testuser@example.com',
//         password: 'plainpassword',
//         phoneNumber: '123456789',
//         defaultLocation: 'New York',
//       };

//       const hashedPassword = 'hashedpassword123';

//       const bcryptHash = jest.fn().mockResolvedValue(hashedPassword);
//       (bcrypt.hash as jest.Mock) = bcryptHash;
//       const mockDate = new Date();
//       jest.spyOn(userRepository, 'create').mockReturnValue({
//         ...mockUserDto,
//         password: hashedPassword,
//         createdAt: mockDate,
//         updatedAt: mockDate,
//       });
//       jest.spyOn(userRepository, 'save').mockResolvedValue({
//         ...mockUserDto,
//         password: hashedPassword,
//         createdAt: mockDate,
//         updatedAt: mockDate,
//       });

//       const result = await userService.createUser(mockUserDto);

//       const expectedUser: UserDto = {
//         id: 1,
//         firstName: 'John',
//         lastName: 'Doe',
//         email: 'testuser@example.com',
//         phoneNumber: '123456789',
//         defaultLocation: 'New York',
//         createdAt: mockDate,
//         updatedAt: mockDate,
//       };
//       expect(result).toEqual(expectedUser);

//       expect(bcrypt.hash).toHaveBeenCalledWith('plainpassword', 10); // Ensure password hashing was done
//       expect(userRepository.create).toHaveBeenCalled();
//       expect(userRepository.save).toHaveBeenCalled();
//     });
//   });
// });
