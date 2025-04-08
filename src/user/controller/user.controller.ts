import { Body, Controller, Delete, Get, HttpCode, Param, Post, Req, UseGuards } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CreateUserDto } from '../models/dto/CreateUser.dto';
import { LoginUserDto } from '../models/dto/LoginUser.dto';
import { UserI } from '../models/user.interface';
import { UserService } from '../service/user.service';

@Controller('users')
export class UserController {

    constructor(private userService: UserService) {}

    @Post('register')
    async create(@Body() createdUserDto: CreateUserDto): Promise<Observable<UserI>> {
        return this.userService.create(createdUserDto);
        // AppConstants.app.xyz
    }

    @Post('login')
    @HttpCode(200)
    login(@Body() loginUserDto: LoginUserDto): Observable<Object> {
        return this.userService.login(loginUserDto).pipe(
            map((jsonStr: any) => {
                var obj = JSON.parse(jsonStr);
                return {
                    access_token: obj.token,
                    token_type: 'JWT',
                    user_Permission:obj.permissionName,
                    expires_in: 10000,
                    id: obj.id
                }
            })
        );
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    findAll(): Observable<UserI[]> {
        return this.userService.findAll();
    }

    @UseGuards(JwtAuthGuard)
    @Get('findByMail/:email')
    async findByMail(@Param('email') email: string): Promise<any> {
      return this.userService.findUserByEmail(email);
    }
    
    @UseGuards(JwtAuthGuard)
    @Get('findOne/:id')
    async findOne(@Param('id') id: number): Promise<any> {
      return this.userService.findOne(id);
    }

    @UseGuards(JwtAuthGuard)
    @Get('profile/:id')
    async info(@Param('id') id: number): Promise<any> {
      return this.userService.findOne(id);
    }

    @Post('resetPassword')
    async resetPassword(@Body() resetPassword: LoginUserDto): Promise<Observable<UserI>> {
        return this.userService.resetPassword(resetPassword);
        // AppConstants.app.xyz
    }

    @UseGuards(JwtAuthGuard)
    @Delete('profile/:id')
    async deleteUser(@Param('id') id: number): Promise<any> {
      return this.userService.deleteUser(id);
    }
}
