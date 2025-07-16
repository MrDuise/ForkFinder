import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Delete,
  Put,
  UseGuards,
  Req,
} from '@nestjs/common';
import { SessionService } from './services/session.service';
import { Session } from './schemas/session.schema';
import { CreateSessionDto } from './dto/create-session-dto';
import { AuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';

@UseGuards(AuthGuard)
@Controller('session')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Post('create')
  async createSession(@Body() data: CreateSessionDto, @Req() req: Request) {
    const userId = req.user?.userId;

    if (!userId) {
      throw new Error('User ID not found in request'); // or throw HttpException
    }
    return this.sessionService.createSession(userId, data);
  }

  @Get(':id')
  async getSession(@Param('id') id: string) {
    return this.sessionService.getSessionById(id);
  }

  @Put(':id')
  async updateSession(@Param('id') id: string, @Body() data: Partial<Session>) {
    return this.sessionService.updateSession(id, data);
  }

  @Delete(':id')
  async deleteSession(@Param('id') id: string) {
    return this.sessionService.deleteSession(id);
  }
}
