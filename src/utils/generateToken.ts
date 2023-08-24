import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt'; // Import JwtService if not already imported
import { InjectModel } from '@nestjs/mongoose';
import { randomBytes } from 'crypto';
import { Model } from 'mongoose';
import { User } from 'src/users/users.model';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectModel('user') private readonly userModel: Model<User>,
  ) {}

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

  async generateGoogleLoginToken(user: any): Promise<any> {
    if (user) {
      return {
        access_token: this.jwtService.sign({
          user: user.id,
          sub: 1,
        }),
      };
    } else {
      return {
        access_token: '',
      };
    }
  }

  async generateVerificationToken(user: User): Promise<string> {
    const verificationToken = randomBytes(32).toString('hex'); // Generate a unique token here
    user.verificationToken = verificationToken;
    await user.save();
    return verificationToken;
  }
}

export interface Tokens {
  generateAccessToken(
    userId: string,
    username: string,
    role: string,
  ): Promise<string>;
  generateRefreshToken(
    userId: string,
    username: string,
    role: string,
  ): Promise<string>;
}
