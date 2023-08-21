import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './users.model';
import { CreateUserDto } from './dto/createUser.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(@InjectModel('user') private readonly userModel: Model<User>) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const { password } = createUserDto;
    const hashedPassword = await bcrypt.hash(password, 10);
    const createdUser = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
    });
    return createdUser.save();
  }

  async getUser(username: string): Promise<User | undefined> {
    const user = await this.userModel.findOne({ username });
    return user;
  }

  async getUserById(userId: string): Promise<User | undefined> {
    const user = await this.userModel.findById(userId);
    return user;
  }

  

 
  async getUserRole(userId: string): Promise<string | undefined> {
    // Logic to fetch user's role based on userId
    const user = await this.userModel.findById(userId);
    return user ? user.role : null; // Replace with actual role
  }
}
