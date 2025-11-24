import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { Type } from "class-transformer";

export class LoginUserDto {

    @IsEmail()
    email!: string;

    @IsNotEmpty()
    password!: string;

    @IsOptional()
    @IsNumber()
    id?: number;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    permissionId?: number;

    @IsOptional()
    @IsString()
    @Type(() => String)
    gwtToken?: string;

    @IsOptional()
    @IsString()
    permissionName?: string;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    phonenumber?: number;

    @IsOptional()
    @IsString()
    tokenStr?: string;

    @IsOptional()
    @IsString()
    name?: string;
}
