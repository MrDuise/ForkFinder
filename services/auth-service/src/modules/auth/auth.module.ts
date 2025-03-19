import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { UserService } from './services/user.service';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import { User } from './entities/user.entity';

console.log('JWT_SECRET:', process.env.JWT_SECRET);

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'), // Use ConfigService to get the secret
        signOptions: { expiresIn: '1h' },
      }),
    }),
  ],
  providers: [AuthService, UserService],
  controllers: [AuthController],
})
export class AuthModule {}
