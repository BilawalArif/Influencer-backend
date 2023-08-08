import { IsString, IsInt } from 'class-validator';

export class UserDto {
  @IsString()
  fullName: string;

  @IsInt()
  age: number;

  @IsString()
  email: string;

  @IsString()
  password: string;

  @IsInt()
  phoneNumber: number;
}
