import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './users.model';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel('user') private readonly userModel: Model<User>,
    private readonly jwtService: JwtService,
  ) {}

  async getUser(username: string): Promise<User | undefined> {
    const user = await this.userModel.findOne({ username });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
  async getUserById(userId: string): Promise<User> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async getUserRole(userId: string): Promise<string | undefined> {
    // Logic to fetch user's role based on userId
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user.role;
  }

  async verifyAccessToken(token: string): Promise<string> {
    const { userId = '' } = await this.jwtService.verify(token);
    return userId || '';
  }

  private validateUserAccess(user: User, userId: string): boolean {
    return userId == user._id.toString();
  }

  private async updateUser(user: User, newUsername: string): Promise<void> {
    user.username = newUsername; // Example update logic
  }

  private async saveUser(user: User): Promise<User> {
    return user.save();
  }

  async updateUserData(userId: string, newUsername: string): Promise<User> {
    const user = await this.getUserById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }
    // user validation
    const isValid = this.validateUserAccess(user, userId);
    // updating user
    this.updateUser(user, newUsername);
    // store user data
    return this.saveUser(user);
  }
}
