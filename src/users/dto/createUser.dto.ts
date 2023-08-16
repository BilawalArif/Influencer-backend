import { IsString, IsInt } from 'class-validator';
import * as bcrypt from 'bcrypt';

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
  role: string;
}
 