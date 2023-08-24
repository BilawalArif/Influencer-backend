import { Injectable, NotAcceptableException } from '@nestjs/common';
import { CreateUserDto } from 'src/users/dto/createUser.dto';
import { User } from 'src/users/users.model';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(@InjectModel('user') private readonly userModel: Model<User>) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const { password } = createUserDto;
    const hashedPassword = await bcrypt.hash(password, 10);
    const createdUser = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
    });
    return createdUser;
  }

  async getUser(username: string): Promise<User | undefined> {
    const user = await this.userModel.findOne({ username });
    if (!user) {
      throw new NotAcceptableException('Could not find the user');
    }
    return user;
  }

  async comparePassword(password: string, newPassword: string): Promise<any> {
    const passwordValid = await bcrypt.compare(password, newPassword);
    return passwordValid;
  }

  async saveUser(createUserDto: CreateUserDto): Promise<User> {
    try {
      const { password, isVerified } = createUserDto;
      const hashedPassword = await bcrypt.hash(password, 10);
      const verified = !isVerified;
      // Assuming you have a User model and it matches your database schema
      const newUser = new this.userModel({
        ...createUserDto,
        password: hashedPassword,
        isVerified: verified,
      });

      return newUser;
    } catch (error) { 
      // Handle errors
      throw new Error('Failed to save user');
    }
  }
}
export interface IAuthService {
  createUser(createUserDto: CreateUserDto): Promise<User>;
  getUser(username: string): Promise<User | undefined>;
  comparePassword(password: string, newPassword: string): Promise<boolean>;
}
