import { Controller, Post, Body, Res } from '@nestjs/common';
import { UserDto } from './dto/user.dto';
import { UserService } from './user.service';
import { Response } from 'express';

@Controller('signup')
export class UserController {
  constructor(private userService: UserService) {}

  @Post()
  async create(@Res() res: Response, @Body() body: UserDto): Promise<any> {
    try {
      const data = await this.userService.create(body);
      res.status(200).json({ data, message: 'user created successfully' });
    } catch (err) {
      throw err;
    }
  }
}
