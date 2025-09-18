import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Session, SessionSchema } from './schemas/session.schema';
import { SessionService } from './services/session.service';
import { SessionController } from './session.controller';
import { RedisConfigModule } from '../redis/redis.module';
import { AuthModule } from '../auth/auth.module';
import { RestaurantSearchModule } from 'src/restaurant-search/restaurant-search.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Session.name, schema: SessionSchema }]),
    AuthModule,
    RedisConfigModule,
    RestaurantSearchModule,
  ],
  providers: [SessionService],
  controllers: [SessionController],
  exports: [SessionService],
})
export class SessionModule {}
