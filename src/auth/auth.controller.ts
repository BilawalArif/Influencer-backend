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

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  // @UseGuards(LocalAuthGuard)
  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Response() res, @Request() req, @Body() loginDto: LoginDto) {
    try {
      const { user } = req.user;
      if (user) {
        const accessToken = await this.authService.generateAccessToken(
          user._id,
          user.username,
          user.role,
        );
        const refreshToken = await this.authService.generateRefreshToken(
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
      const user = await this.usersService.createUser(createUserDto);

      res.status(200).json({
        user,
        message: 'user created successfully',
      });
    } catch (error) {
      throw error;
    }
  }
  @UseGuards(jwtGuard)
  @UseGuards(RoleGuard) // Apply Role-based authorization
  @Roles(Role.Admin) // Only users with 'admin' role can access this route
  @Get(':id')
  async getUserById(@Param('id') userId: string) {
    const user = await this.usersService.getUserById(userId);
    return user;
  }

  @UseGuards(jwtGuard)
  @Get('profile')
  getProfile(@Request() req) {
    console.log("🚀 ~ file: auth.controller.ts:88 ~ AuthController ~ getProfile ~ req.user:", req.user)
    return req.user;
  }

  
}
