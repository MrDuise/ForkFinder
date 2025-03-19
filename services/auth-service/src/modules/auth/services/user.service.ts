import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { RegisterUserDto } from '../dto/register-user.dto';
import { UserDto } from '../dto/user.dto';
import { plainToInstance } from 'class-transformer';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
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
}
