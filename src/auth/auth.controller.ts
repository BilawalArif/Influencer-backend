import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
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
  Param,
} from '@nestjs/common';
import { CreateUserDto } from 'src/users/dto/createUser.dto';
import { LoginDto } from 'src/users/dto/login.dto';
import { Public } from 'src/decorators/public.decorator';
import { jwtGuard } from './guards/jwt.auth.guard';
import { RefreshJwtGuard } from './guards/refreshJwt.auth.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from 'src/enums/role.enum';
import { RoleGuard } from './guards/roles.auth.guard';
import { GoogleAuthGuard } from './guards/google.auth.guard';
import { TokenService } from 'src/utils/generateToken';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/users/users.model';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
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
  @UseGuards(jwtGuard)
  @UseGuards(RoleGuard) // Apply Role-based authorization
  @Roles(Role.Admin) // Only users with 'admin' role can access this route
  @Get(':id')
  async getUserById(@Param('id') userId: string) {
    const user = await this.usersService.getUserById(userId);
    return user;
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
    const jwt = await this.tokenService.googleLogin(req.user);
    res.set('authorization', jwt.access_token);

    const createdUser = new this.userModel({ user: req.user });

    res.json(req.user);
  }
}
