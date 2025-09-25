import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersRepository } from '../repositories/users.repository';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async create(createUserDto: CreateUserDto) {
    return this.usersRepository.create(createUserDto);
  }

  async findById(id: string) {
    return this.usersRepository.findById(id);
  }

  async findByEmail(email: string) {
    return this.usersRepository.findByEmail(email);
  }

  async findByEmailVerificationToken(token: string) {
    return this.usersRepository.findByEmailVerificationToken(token);
  }

  async findByPasswordResetToken(token: string) {
    return this.usersRepository.findByPasswordResetToken(token);
  }

  async getProfile(userId: string) {
    const user = await this.usersRepository.findByIdWithProfile(userId);
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    const user = await this.findById(userId);
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.usersRepository.updateProfile(userId, updateProfileDto);
  }

  async updateUser(userId: string, updateUserDto: UpdateUserDto) {
    const user = await this.findById(userId);
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.usersRepository.updateUser(userId, updateUserDto);
  }

  async deleteUser(userId: string) {
    const user = await this.findById(userId);
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.usersRepository.deleteUser(userId);
    
    return { message: 'User deleted successfully' };
  }
}