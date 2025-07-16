import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { UserService } from './services/user.service';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import { User } from './entities/user.entity';
import { UserController } from './controllers/user.controller';
import { UserPreferences } from './entities/profile.entity';
import { AuthGuard } from './jwt-auth.guard';

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
    TypeOrmModule.forFeature([UserPreferences]),
  ],
  providers: [AuthService, UserService, AuthGuard],
  controllers: [AuthController, UserController],
  exports: [
    AuthService,
    UserService,
    AuthGuard,
    JwtModule, // Export JwtModule so other modules can use it
  ],
})
export class AuthModule {}
