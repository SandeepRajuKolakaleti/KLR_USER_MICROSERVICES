import { IsNumber, IsOptional, IsString } from "class-validator";
import { LoginUserDto } from "./LoginUser.dto";
import { Type } from "class-transformer";


export class CreateUserDto extends LoginUserDto {
    
    @IsString()
    name!: string;

    @IsString()
    userRole!: string;

    @IsOptional()
    @IsString()
    image?: string;
    	
	@IsString()
    @IsOptional()
    address?:string;
	
	@IsString()
    @IsOptional()
    birthday?:string;

    @IsOptional()
    @IsString()
    @Type(() => String)
    totalSales?: string;

    @IsOptional()
    @IsString()
    @Type(() => String)
    revenue?: string;
    
}

export class UpdateUserDto extends CreateUserDto {
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    Id?: number;
}