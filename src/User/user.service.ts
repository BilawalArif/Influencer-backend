import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { UserDto } from './dto/user.dto';
import { User } from './Schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async create(userDto: UserDto): Promise<User> {
    const createdUser = new this.userModel(userDto);
    const result = await createdUser.save();
    return result;
  }
}
