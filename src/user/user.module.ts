import { Module } from '@nestjs/common';
import { UserService } from './service/user.service';
import { UserController } from './controller/user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './models/user.entity';
import { AuthModule } from '../auth/auth.module';
import { UserPermissionEntity } from './models/user.permission.entity';
import { JwtModule } from '@nestjs/jwt';
import { AppConstants } from 'src/app.constants';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity,UserPermissionEntity]),
    AuthModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        global: true,
        secret: configService.get<string>('JWT_SECRETKEY'),
        signOptions: { expiresIn: '60s' },
      }),
    }),
  ],
  providers: [UserService],
  controllers: [UserController]
})
export class UserModule {}
