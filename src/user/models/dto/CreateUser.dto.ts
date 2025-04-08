import { IsString } from "class-validator";
import { LoginUserDto } from "./LoginUser.dto";


export class CreateUserDto extends LoginUserDto {
    createdUserDto: any;
    [x: string]: any;

    @IsString()
    name!: string; 

    @IsString()
    userRole!:String;

    


    
}