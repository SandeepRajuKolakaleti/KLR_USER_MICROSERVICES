import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Post, Query, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CreateUserDto, UpdateUserDto } from '../models/dto/CreateUser.dto';
import { LoginUserDto } from '../models/dto/LoginUser.dto';
import { UserI } from '../models/user.interface';
import { UserService } from '../service/user.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { PaginatedResult } from '../models/pagination.interface';

@Controller('users')
export class UserController {

    constructor(private userService: UserService) {}

    @Post('register')
    @UseInterceptors(FileInterceptor('file'))
    async create(@UploadedFile() file: Express.Multer.File, @Body() createUserDto: CreateUserDto): Promise<Observable<UserI>> {
      console.log(file);
      return await this.userService.upload(file.originalname, file.buffer).then((data) => {
        createUserDto.image = data;
        return this.userService.create(createUserDto);
      });
      // AppConstants.app.xyz
    }

    @Post('login')
    @HttpCode(200)
    login(@Body() loginUserDto: LoginUserDto): Observable<Object> {
        return this.userService.login(loginUserDto).pipe(
            map((jsonStr: any) => {
              var obj = JSON.parse(jsonStr);
              let result = {
                access_token: obj.token,
                token_type: 'JWT',
                user_Permission:obj.permissionName,
                expires_in: 10000,
                id: obj.id
              }
              console.log('Login response object:', result);
              return result;
            })
        );
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    findAll(
      @Req() request: Request, 
      @Query("offset", new ParseIntPipe({ optional: true })) offset = 0,
      @Query("limit", new ParseIntPipe({ optional: true })) limit = 10,
    ): Observable<PaginatedResult<UserI>> {
      return this.userService.findAll({
        offset: Number(offset),
        limit: Number(limit)
      });
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

    @Post('update')
    @UseInterceptors(FileInterceptor('file'))
    async update(@UploadedFile() file: Express.Multer.File, @Body() updateUserDto: UpdateUserDto): Promise<Observable<UserI>> {
      console.log(file);
      let userId = Number(updateUserDto.Id);
      return await this.userService.upload(file.originalname, file.buffer).then((data) => {
        updateUserDto.image = data;
        return this.userService.update(userId, updateUserDto);
      });
      // AppConstants.app.xyz
    }

    @UseGuards(JwtAuthGuard)
    @Post('uploadImgToBase64')
    async base64(@Body() img: any) {
        console.log(img);
        return this.userService.getImageUrlToBase64(img.url);
    }
}
