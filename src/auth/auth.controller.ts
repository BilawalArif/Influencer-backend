import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local.auth.guard';
import {
  Body,
  Controller,
  Post,
  Request,
  UseGuards,
  Res,
  Req,
  Get,
  Param,
} from '@nestjs/common';
import { CreateUserDto } from 'src/users/dto/createUser.dto';
import { Public } from 'src/decorators/public.decorator';
import { jwtGuard } from './guards/jwt.auth.guard';
import { GoogleAuthGuard } from './guards/google.auth.guard';
import { TokenService } from 'src/utils/generateToken';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/users/users.model';
import { Response } from 'express';
import { MailService } from './mails/mail.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private mailService: MailService,
    private tokenService: TokenService,
    @InjectModel('user') private readonly userModel: Model<User>,
  ) {}

  private async generateTokens(user: User): Promise<{
    accessToken: string;
    refreshToken: string;
    googleAuthToken: any;
  }> {
    const accessToken = await this.tokenService.generateAccessToken(
      user._id,
      user.username,
      user.role,
    );
    const refreshToken = await this.tokenService.generateRefreshToken(
      user._id,
      user.username,
      user.role,
    );
    const googleAuthToken = await this.tokenService.generateGoogleLoginToken(
      user,
    );

    return { accessToken, refreshToken, googleAuthToken };
  }

  private setAuthorizationHeader(res: Response, token: string): void {
    res.set('authorization', token);
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Res() res, @Request() req) {
    try {
      const { user } = req.user;
      if (user) {
        const { accessToken = '', refreshToken = '' } =
          await this.generateTokens(user);
        this.setAuthorizationHeader(res, accessToken);

        res.status(200).json({
          user,
          accessToken,
          refreshToken,
          message: 'User logged in successfully',
        });
      }
    } catch (error) {
      throw error;
    }
  }

  private async createUser(createUserDto: CreateUserDto): Promise<User> {
    return this.authService.createUser(createUserDto);
  }

  private async sendVerificationEmail(user: User): Promise<void> {
    const verificationToken = await this.tokenService.generateVerificationToken(
      user,
    );
    await this.mailService.sendVerificationEmail(user.email, verificationToken);
  }

  private sendSignupResponse(res: Response, user: User): void {
    res.status(200).json({
      user,
      message: 'User created. Check your email for verification.',
    });
  }

  @Public()
  @Post('signup')
  async signup(@Res() res, @Body() createUserDto: CreateUserDto) {
    try {
      const user = await this.createUser(createUserDto);
      await this.sendVerificationEmail(user);

      this.sendSignupResponse(res, user);
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(jwtGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  //Hitting this url will take us to google signup UI
  @Public()
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth() {}

  //This takes email and return user obj with token in headers
  @Public()
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect(@Req() req, @Res() res) {
    try {
      const { googleAuthToken } = await this.generateTokens(req.user);
      this.setAuthorizationHeader(res, googleAuthToken.access_token);

      const queryParams = new URLSearchParams({
        email: req.user.email,
      });

      const redirectUrl = `/auth/formPage/?${queryParams}`;
      res.redirect(redirectUrl);
    } catch (error) {
      throw error;
    }
  }

  @Public()
  @Get('formPage')
  async getHomePage(@Req() req, @Res() res: Response): Promise<void> {
    // Get query parameters
    const queryParams = req.query;

    // Render a form with the retrieved query parameters
    const formHtml = this.formHtml(queryParams.email);

    res.send(formHtml);
  }

  @Public()
  @Post('update-user')
  async updateUserAttributes(@Body() userData: User, @Res() res) {
    try {
      const user = await this.authService.saveGoogleUser(userData);
      // Send a success response
      if (user) {
        res.status(200).json({ user, message: 'User created successfully' });
      }

      // Save user to database
      await user.save();
    } catch (error) {
      // Handle errors
      throw error;
    }
  }

  @Public()
  @Get('verify/:token')
  // @Redirect('/account-verified')
  async verifyAccount(@Param('token') token: string) {
    const user = await this.mailService.verifyUserByToken(token);

    if (user) {
      return { statusCode: 302, meassage: 'account-verified' };
    } else {
      return { statusCode: 302, meassage: 'verification-failed' };
    }
  }

  private formHtml(email: string): string {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Update User Information</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f5f5f5;
          margin: 0;
          padding: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
        }
        .form-container {
          background-color: #ffffff;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2);
          width: 300px;
          text-align: center;
        }
        .form-input {
          margin-bottom: 10px;
          padding: 10px;
          border: 1px solid #ccc;
          border-radius: 4px;
          width: 100%;
          box-sizing: border-box;
          font-size: 14px;
        }
        .form-button {
          background-color: #007bff;
          color: #ffffff;
          border: none;
          border-radius: 4px;
          padding: 10px;
          width: 100%;
          font-size: 16px;
          cursor: pointer;
        }
      </style>
    </head>
    <body>
      <div class="form-container">
        <h2>Update User Information</h2>
        <form action="/auth/update-user" method="post">
          <input class="form-input" type="text" name="email" placeholder="Email" value="${email}">
          <input class="form-input" type="text" name="username" placeholder="Username">
          <input class="form-input" type="password" name="password" placeholder="Password">
          <input class="form-input" type="number" name="phoneNumber" placeholder="Phone Number">
          <input class="form-input" type="number" name="age" placeholder="Age">
          <button class="form-button" type="submit">Update</button>
        </form>
      </div>
    </body>
    </html>
  `;
  }
}
