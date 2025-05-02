import { PrismaClient } from '@prisma/client';
import { UserOutput, UserUpdateInput, PasswordUpdateInput, NotFoundError, UnauthorizedError } from '../types';
import { UserRepository } from '../repositories/user.repository';
import { comparePassword } from '../utils/password';

export class UserService {
  private userRepository: UserRepository;

  constructor(prisma: PrismaClient) {
    this.userRepository = new UserRepository(prisma);
  }

  /**
   * Get user profile
   */
  async getProfile(userId: string): Promise<UserOutput> {
    const user = await this.userRepository.findById(userId);
    
    if (!user) {
      throw new NotFoundError('User not found');
    }
    
    return user;
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, data: UserUpdateInput): Promise<UserOutput> {
    const user = await this.userRepository.findById(userId);
    
    if (!user) {
      throw new NotFoundError('User not found');
    }
    
    return this.userRepository.update(userId, data);
  }

  /**
   * Update user password
   */
  async updatePassword(userId: string, data: PasswordUpdateInput): Promise<{ message: string }> {
    const user = await this.userRepository.findByEmail(
      (await this.userRepository.findById(userId))?.email || ''
    );
    
    if (!user) {
      throw new NotFoundError('User not found');
    }
    
    // Verify old password
    const isPasswordValid = await comparePassword(data.oldPassword, user.password);
    
    if (!isPasswordValid) {
      throw new UnauthorizedError('Current password is incorrect');
    }
    
    // Update password
    await this.userRepository.updatePassword(userId, data.newPassword);
    
    return {
      message: 'Password updated successfully',
    };
  }

  /**
   * Delete user account
   */
  async deleteAccount(userId: string): Promise<{ message: string }> {
    const user = await this.userRepository.findById(userId);
    
    if (!user) {
      throw new NotFoundError('User not found');
    }
    
    await this.userRepository.delete(userId);
    
    return {
      message: 'Account deleted successfully',
    };
  }
}