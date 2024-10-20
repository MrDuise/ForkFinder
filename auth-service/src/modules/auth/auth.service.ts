// eslint-disable-next-line prettier/prettier
import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async registerUser(
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    phoneNumber?: string,
    defaultLocation?: string,
  ): Promise<User> {
    // Check if the email already exists
    // eslint-disable-next-line prettier/prettier
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new BadRequestException('Email is already in use.');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user entity and save to the database
    const user = this.userRepository.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phoneNumber,
      defaultLocation,
    });

    return this.userRepository.save(user);
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    // Return the user without the password field
    const { password: _, ...result } = user;
    return result;
  }

  async login(user: any): Promise<{ accessToken: string }> {
    const payload = { email: user.email, sub: user.id };
    return {
      accessToken: await this.jwtService.signAsync(payload),
    };
  }
}
