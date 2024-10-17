import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findOne(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async createUser(
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    phoneNumber?: string,
    defaultLocation?: string,
  ): Promise<User> {
    return this.userRepository.create({
      firstName,
      lastName,
      email,
      password,
      phoneNumber,
      defaultLocation,
    });
  }

  saveUser(user: User) {
    return this.userRepository.save(user);
  }

  // Other user-related methods (e.g., createUser, updateUser) can go here
}
