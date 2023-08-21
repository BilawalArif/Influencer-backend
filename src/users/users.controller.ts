import {
  Body,
  Controller,
  Post,
  Get,
  Param,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import * as bcrypt from 'bcrypt';
import { LocalAuthGuard } from 'src/auth/guards/local.auth.guard';
import { CreateUserDto } from './dto/createUser.dto';
import { Public } from 'src/decorators/public.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  //post / signup
  @Public()
  @Post('signup')
  async signup(@Res() res, @Body() createUserDto: CreateUserDto) {
    const saltOrRounds = 10;
    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      saltOrRounds,
    );
    // Hash the password before creating the user
    createUserDto.password = hashedPassword;

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
  //Post / Login
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Res() res, @Req() req) {
    try {
      await res.status(200).json({ ...req.user, message: 'User logged in' });
    } catch (error) {
      throw error;
    }
  }
}
