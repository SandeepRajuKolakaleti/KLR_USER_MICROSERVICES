import { IsEmail, IsNotEmpty } from "class-validator";
import { clearScreenDown } from "readline";

export class LoginUserDto {

    @IsEmail()
    email!: string;

    @IsNotEmpty()
    password!: string;

    id?:number;

    permissionId!: number;

    gwtToken?:String;

    permissionName?:String;

    phonenumber?:number;

    tokenStr?:string;

    name?: string;
}