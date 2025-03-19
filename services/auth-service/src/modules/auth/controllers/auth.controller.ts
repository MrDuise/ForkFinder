import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { RegisterUserDto } from '../dto/register-user.dto';
import { UserService } from '../services/user.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Post('register')
  async register(@Body() userDto: RegisterUserDto) {
    return this.userService.createUser(userDto);
  }

  @Post('login')
  @HttpCode(200)
  async login(
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    return this.authService.login(email, password);
  }
}
