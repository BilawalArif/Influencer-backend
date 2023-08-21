import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt'; // Import JwtService if not already imported

@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService) {}

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

  async googleLogin(user: any): Promise<any> {
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
