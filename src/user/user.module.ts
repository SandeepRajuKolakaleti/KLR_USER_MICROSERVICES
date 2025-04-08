import { Module } from '@nestjs/common';
import { UserService } from './service/user.service';
import { UserController } from './controller/user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './models/user.entity';
import { AuthModule } from '../auth/auth.module';
import { UserPermissionEntity } from './models/user.permission.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity,UserPermissionEntity]),
    AuthModule
  ],
  providers: [UserService],
  controllers: [UserController]
})
export class UserModule {}
