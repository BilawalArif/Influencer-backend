import { Injectable, NotAcceptableException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/users.model';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private jwtService: JwtService,
  ) {}
  async login(username: string, password: string): Promise<any> {
    const user = await this.usersService.getUser(username);

    if (!user) {
      throw new NotAcceptableException('Could not find the user');
    }

    const passwordValid = await bcrypt.compare(password, user.password);

    if (passwordValid) {
      const access_token = await this.generateAccessToken(
        user._id,
        user.username,
      );
      const refresh_token = await this.generateRefreshToken(
        user._id,
        user.username,
      );

      return {
        user,
        access_token,
        refresh_token,
      };
    }

    return null;
  }

  private async generateAccessToken(
    userId: string,
    username: string,
  ): Promise<string> {
    const payload = { sub: userId, username };
    return await this.jwtService.signAsync(payload);
  }

  private async generateRefreshToken(
    userId: string,
    username: string,
  ): Promise<string> {
    const payload = { sub: userId, username };
    return await this.jwtService.signAsync(payload, { expiresIn: '7d' });
  }
}
