import {
  Body,
  Controller,
  Req,
  HttpCode,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { UserService } from '../services/user.service';
import { AuthGuard } from '../jwt-auth.guard';

import { Request } from 'express';
import { ProfileRequest } from '../dto/updateProfileRequest';

@UseGuards(AuthGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {
    console.log('UserController loaded');
  }

  @Patch('profileInfo')
  @HttpCode(200)
  async updateProfile(
    @Body() updateProfile: ProfileRequest,
    @Req() req: Request,
  ) {
    const userId = req.user?.userId;
    console.log('this is the userID: ' + userId);

    if (!userId) {
      throw new Error('User ID not found in request'); // or throw HttpException
    }

    return this.userService.updateProfile(userId, updateProfile);
  }
}
