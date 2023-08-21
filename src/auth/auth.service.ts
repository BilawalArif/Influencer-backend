import { Injectable, NotAcceptableException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/users.model';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('user') private readonly userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async getUser(username: string): Promise<User | undefined> {
    const user = await this.userModel.findOne({ username });
    if (!user) {
      throw new NotAcceptableException('Could not find the user');
    }
    return user;
  }

  async generateAccessToken(
    userId: string,
    username: string,
    role: string,
  ): Promise<string> {
    const payload = { sub: userId, username, role };

    return await this.jwtService.signAsync(payload);
  }

  async generateRefreshToken(
    userId: string,
    username: string,
    role: string,
  ): Promise<string> {
    const payload = { sub: userId, username, role };
    return await this.jwtService.signAsync(payload, { expiresIn: '7d' });
  }

  async comparePassword(password: string, newPassword: string): Promise<any> {
    const passwordValid = await bcrypt.compare(password, newPassword);
    return passwordValid;
  }
}
