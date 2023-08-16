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
} from '@nestjs/common';
import { CreateUserDto } from 'src/users/dto/createUser.dto';
import { LoginDto } from 'src/users/dto/login.dto';
import { Public } from 'src/decorators/public.decorator';
import { jwtGuard } from './guards/jwt.auth.guard';
import { RefreshJwtGuard } from './guards/refreshJwt.auth.guard';


@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Public()
  
  @Post('login')
  
  async login(@Body() loginDto: LoginDto) {
    try {
      return await this.authService.login(loginDto.username, loginDto.password);
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
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
  @UseGuards(RefreshJwtGuard)
  @Get('profileOne')
  getProfileOne(@Request() req) {
    return req.user;
  }
}
