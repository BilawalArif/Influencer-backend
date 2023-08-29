import { IsString, IsInt, } from 'class-validator';
import { Role } from 'src/enums/role.enum';

export class CreateUserDto {
  @IsString()
  username: string;

  @IsInt()
  age: number;

  @IsString()
  email: string;

  @IsString()
  password: string;

  @IsInt()
  phoneNumber: number;

  @IsString()
  role: Role;
  
  isVerified: boolean;
}
 