// eslint-disable-next-line prettier/prettier
import { Injectable, UnauthorizedException, UseInterceptors } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UserService } from './user.service';
import { DatabaseRetryInterceptor } from '../../../interceptors/database-retry.interceptor';

@Injectable()
@UseInterceptors(DatabaseRetryInterceptor)
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }

  //TODO: Current system requires a user account,
  //Implement guest access with temporary user profiles later
  //Maybe just create a temporary user in the DB that gets deleted after session ends
  //Or use JWT without user record, but that limits ability to save preferences
  async login(
    email: string,
    password: string,
  ): Promise<{ accessToken: string }> {
    const user = await this.validateUser(email, password);
    const payload = { sub: user.id, email: user.email };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  // Placeholder for logout functionality
  //async logout(){}

  //need Google login too
}
