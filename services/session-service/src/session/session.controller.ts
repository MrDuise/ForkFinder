import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Delete,
  Put,
} from '@nestjs/common';
import { SessionService } from './services/session.service';
import { Session } from './schemas/session.schema';

@Controller('sessions')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Post()
  async createSession(@Body() data: Partial<Session>) {
    return this.sessionService.createSession(data);
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
