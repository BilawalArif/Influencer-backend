import {
  Controller,
  Get,
  Patch,
  Param,
  Req, 
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Roles } from 'src/decorators/roles.decorator';
import { jwtGuard } from 'src/auth/guards/jwt.auth.guard';
import { RoleGuard } from 'src/auth/guards/roles.auth.guard';
import { Role } from 'src/enums/role.enum';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(jwtGuard)
  @Patch('/update')
  async updateUserData(@Req() req) {
    const accessToken = req.headers['authorization'].split(' ')[1];
    const userId = await this.usersService.verifyAccessToken(accessToken);

    if (!userId) {
      throw new UnauthorizedException('Invalid token');
    }

    const newUsername = req.body.username;
    const updateResult = await this.usersService.updateUserData(
      userId,
      newUsername,
    ); 
    return updateResult;
  }
  @UseGuards(jwtGuard)
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
