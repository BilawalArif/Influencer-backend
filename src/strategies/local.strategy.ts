import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth/auth.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super();
  }
  async validate(username: string, password: string): Promise<any> {
    const user = await this.authService.getUser(username);
    if (!user) {
      throw new UnauthorizedException('Cannot find user');
    }
    const passwordValid = await this.authService.comparePassword(
      password,
      user.password,
    );
    if (user && passwordValid) {
      // Convert the Mongoose document to plain JSON
      const userPlain = user.toJSON();

      // Delete the password field from the plain object
      delete userPlain.password;
      return {
        user: userPlain,
      };
    }
    throw new UnauthorizedException('Invalid Password');
  }
}
