import { IsString } from "class-validator";
import { LoginUserDto } from "./LoginUser.dto";


export class CreateUserDto extends LoginUserDto {

    @IsString()
    name!: string; 

    @IsString()
    userRole!: string;

    @IsString()
    image!:string;


    
}