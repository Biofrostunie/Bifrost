import { PrismaClient } from '@prisma/client';
import { 
  UserInput, 
  LoginInput, 
  LoginOutput, 
  ResetPasswordInput,
  ConfirmResetPasswordInput,
  UnauthorizedError, 
  ConflictError,
  NotFoundError,
  BadRequestError 
} from '../types';
import { UserRepository } from '../repositories/user.repository';
import { AuthRepository } from '../repositories/auth.repository';
import { comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';

export class AuthService {
  private userRepository: UserRepository;
  private authRepository: AuthRepository;

  constructor(prisma: PrismaClient) {
    this.userRepository = new UserRepository(prisma);
    this.authRepository = new AuthRepository(prisma);
  }

  /**
   * Register a new user
   */
  async register(userData: UserInput): Promise<{ id: string; email: string; name: string }> {
    // Check if user with email already exists
    const existingUser = await this.userRepository.findByEmail(userData.email);
    
    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }
    
    // Create user
    const user = await this.userRepository.create(userData);
    
    return {
      id: user.id,
      email: user.email,
      name: user.name,
    };
  }

  /**
   * Login a user
   */
  async login(loginData: LoginInput): Promise<LoginOutput> {
    // Find user by email
    const user = await this.userRepository.findByEmail(loginData.email);
    
    // Check if user exists
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }
    
    // Verify password
    const isPasswordValid = await comparePassword(loginData.password, user.password);
    
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid credentials');
    }
    
    // Generate token
    const token = generateToken({ userId: user.id, email: user.email });
    
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      token,
    };
  }

  /**
   * Initiate password reset
   */
  async resetPassword(data: ResetPasswordInput): Promise<{ message: string }> {
    // Find user by email
    const user = await this.userRepository.findByEmail(data.email);
    
    if (!user) {
      throw new NotFoundError('User not found');
    }
    
    // Create reset token
    const resetToken = await this.authRepository.createResetToken(user.id);
    
    // In a real application, send the token to the user's email
    // This is a placeholder for the email sending logic
    console.log(`Reset token for ${user.email}: ${resetToken.token}`);
    
    return {
      message: 'Password reset instructions sent to email',
    };
  }

  /**
   * Confirm and complete password reset
   */
  async confirmResetPassword(data: ConfirmResetPasswordInput): Promise<{ message: string }> {
    // Find token
    const resetToken = await this.authRepository.getResetToken(data.token);
    
    if (!resetToken) {
      throw new BadRequestError('Invalid or expired token');
    }
    
    // Check if token is expired
    if (resetToken.expiresAt < new Date()) {
      // Delete expired token
      await this.authRepository.deleteResetToken(data.token);
      throw new BadRequestError('Token has expired');
    }
    
    // Update user password
    await this.userRepository.updatePassword(resetToken.userId, data.newPassword);
    
    // Delete used token
    await this.authRepository.deleteResetToken(data.token);
    
    return {
      message: 'Password has been reset successfully',
    };
  }
}