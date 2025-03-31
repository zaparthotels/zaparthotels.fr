import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user.schema';
import { UserDto } from './user.dto';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async findOne(id: string): Promise<User> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
    return user;
  }

  async create(createUserDto: UserDto): Promise<User> {
    const createdUser = new this.userModel(createUserDto);
    return createdUser.save();
  }

  async update(updateUserDto: UserDto): Promise<User> {
    const existingUser = await this.userModel
      .findByIdAndUpdate(updateUserDto, { new: true })
      .exec();
    if (!existingUser) {
      throw new NotFoundException(
        `User with ID "${updateUserDto.id}" not found`,
      );
    }
    return existingUser;
  }

  async delete(id: string): Promise<User> {
    const deletedUser = await this.userModel.findByIdAndDelete(id).exec();
    if (!deletedUser) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
    return deletedUser;
  }
}
