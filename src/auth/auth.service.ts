import { Injectable, NotAcceptableException } from '@nestjs/common';
import { CreateUserDto } from 'src/users/dto/createUser.dto';
import { User } from 'src/users/users.model';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(@InjectModel('user') private readonly userModel: Model<User>) {}

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  private async createAndSaveUser(userDto: CreateUserDto): Promise<User> {
    const createdUser = new this.userModel(userDto);
    return createdUser.save();
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await this.hashPassword(createUserDto.password);

    const createdUser = this.createAndSaveUser({
      ...createUserDto,
      password: hashedPassword,
    });

    return createdUser;
  }

  private async createGoogleUser(createUserDto: CreateUserDto): Promise<User> {
    const { isVerified } = createUserDto;
    const verified = !isVerified;
    const hashedPassword = await this.hashPassword(createUserDto.password);

    return new this.userModel({
      ...createUserDto,
      password: hashedPassword,
      isVerified: verified,
    });
  }

  async getUser(username: string): Promise<User | undefined> {
    const user = await this.userModel.findOne({ username });
    if (!user) {
      throw new NotAcceptableException('Could not find the user');
    }
    return user;
  }

  async comparePassword(password: string, newPassword: string): Promise<boolean> {
    const passwordValid = await bcrypt.compare(password, newPassword);
    return passwordValid;
  }

  async saveGoogleUser(createUserDto: CreateUserDto): Promise<User> {
    const newUser = await this.createGoogleUser(createUserDto);

    try {
      const savedUser = await newUser.save();
      return savedUser;
    } catch (error) {
      throw new Error('Failed to save user');
    }
  }
}
export interface IAuthService {
  createUser(createUserDto: CreateUserDto): Promise<User>;
  getUser(username: string): Promise<User | undefined>;
  comparePassword(password: string, newPassword: string): Promise<boolean>;
}
