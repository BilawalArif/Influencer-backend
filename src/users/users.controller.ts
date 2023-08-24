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
import { Roles } from 'src/decorators/roles.decorator';
import { jwtGuard } from 'src/auth/guards/jwt.auth.guard';
import { RoleGuard } from 'src/auth/guards/roles.auth.guard';
import { Role } from 'src/enums/role.enum';
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
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Res() res, @Req() req) {
    try {
      await res.status(200).json({ ...req.user, message: 'User logged in' });
    } catch (error) {
      throw error;
    }
  }@UseGuards(jwtGuard)
  @UseGuards(RoleGuard) // Apply Role-based authorization
  @Roles(Role.Admin) // Only users with 'admin' role can access this route
  @Get(':id')
  async getUserById(@Param('id') userId: string) {
    const user = await this.usersService.getUserById(userId);
    return user;
  }
 
  @Get(':id/role')
  async getUserRole(@Param('id') userId: string) {
    const user = await this.usersService.getUserRole(userId);

    return user;
  }
}
