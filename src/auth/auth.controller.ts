import { AuthService, IAuthService } from './auth.service';
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
  Response,
} from '@nestjs/common';
import { CreateUserDto } from 'src/users/dto/createUser.dto';
import { Public } from 'src/decorators/public.decorator';
import { jwtGuard } from './guards/jwt.auth.guard';
import { TokenService } from 'src/utils/generateToken';
import { GoogleAuthGuard } from './guards/google.auth.guard';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/users/users.model';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private tokenService: TokenService,
    @InjectModel('user') private readonly userModel: Model<User>,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Response() res, @Request() req) {
    try {
      const { user } = req.user;
      if (user) {
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
        res.status(200).json({
          user,
          accessToken,
          refreshToken,
          message: 'user logged in successfully',
        });
      }
    } catch (error) {
      throw error;
    }
  }

  @Public()
  @Post('signup')
  async signup(@Res() res, @Body() createUserDto: CreateUserDto) {
    try {
      const user = await this.authService.createUser(createUserDto);
      res.status(200).json({
        user,
        message: 'user created successfully',
      });
      await user.save();
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
  @UseGuards(GoogleAuthGuard)
  @Get('google')
  async googleAuth() {}


  //This takes email and return user obj with token in headers
  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google/callback')
  async googleAuthRedirect(@Req() req, @Res() res) {
    const jwt = await this.tokenService.googleLogin(req.user);
    res.set('authorization', jwt.access_token);

    const createdUser = new this.userModel({user: req.user});

    res.json(req.user);
  }
} 
