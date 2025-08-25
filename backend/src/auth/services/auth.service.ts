import { Injectable, ConflictException, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

import { UsersService } from '../../users/services/users.service';
import { EmailService } from '../../common/services/email.service';
import { RegisterDto } from '../dto/register.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { CurrentUserType } from '../../common/decorators/current-user.decorator';

interface AuthContext {
  ip: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}

  async register(registerDto: RegisterDto, context?: AuthContext) {
    this.logger.log(`Registration attempt for email: ${registerDto.email}`);
    
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    
    if (existingUser) {
      this.logger.warn(`Registration failed - user already exists: ${registerDto.email}`);
      throw new ConflictException('User already exists with this email');
    }

    const passwordHash = await bcrypt.hash(registerDto.password, 12);
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    
    const user = await this.usersService.create({
      email: registerDto.email,
      passwordHash,
      fullName: registerDto.fullName,
      emailVerificationToken,
    });

    // Send verification email
    try {
      await this.emailService.sendVerificationEmail(
        user.email, 
        user.fullName || 'User', 
        emailVerificationToken
      );
      this.logger.log(`Verification email sent to: ${user.email}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to send verification email: ${errorMessage}`);
      // Don't fail registration if email fails
    }

    this.logger.log(`User registered successfully: ${user.email}`);
    
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      isEmailVerified: user.isEmailVerified,
    };
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    
    if (user && await bcrypt.compare(password, user.passwordHash)) {
      const { passwordHash, ...result } = user;
      return result;
    }
    
    return null;
  }

  async login(user: CurrentUserType, context?: AuthContext) {
    this.logger.log(`Login successful for user: ${user.email}`);
    
    // Payload simples sem duplicação de campos
    const payload = { 
      email: user.email, 
      sub: user.id,
      // Removido iss e aud do payload para evitar conflito
    };
    
    const accessToken = this.jwtService.sign(payload);
    
    return {
      access_token: accessToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
      },
    };
  }

  async verifyEmail(token: string) {
    this.logger.log(`Email verification attempt with token: ${token.substring(0, 8)}...`);
    
    const user = await this.usersService.findByEmailVerificationToken(token);
    
    if (!user || user.emailVerificationToken !== token) {
      this.logger.warn(`Invalid verification token: ${token.substring(0, 8)}...`);
      throw new UnauthorizedException('Invalid verification token');
    }

    const updatedUser = await this.usersService.updateUser(user.id, {
      isEmailVerified: true,
      emailVerificationToken: undefined,
    });

    this.logger.log(`Email verified successfully for user: ${user.email}`);

    return {
      message: 'Email verified successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        fullName: updatedUser.fullName,
        isEmailVerified: updatedUser.isEmailVerified,
      },
    };
  }

  async forgotPassword(email: string) {
    this.logger.log(`Password reset request for email: ${email}`);
    
    const user = await this.usersService.findByEmail(email);
    
    if (!user) {
      this.logger.warn(`Password reset failed - user not found: ${email}`);
      throw new UnauthorizedException('User not found');
    }

    // Generate 5-digit code
    const resetToken = Math.floor(10000 + Math.random() * 90000).toString();
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour

    await this.usersService.updateUser(user.id, {
      passwordResetToken: resetToken,
      passwordResetExpires: resetExpires,
    });

    // Send reset email
    try {
      await this.emailService.sendPasswordResetEmail(
        user.email, 
        user.fullName || 'User', 
        resetToken
      );
      this.logger.log(`Password reset email sent to: ${user.email}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to send password reset email: ${errorMessage}`);
      throw new Error('Failed to send password reset email');
    }

    return {
      message: 'Password reset code sent to your email',
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, newPassword } = resetPasswordDto;
    
    this.logger.log(`Password reset attempt with token: ${token}`);
    
    const user = await this.usersService.findByPasswordResetToken(token);
    
    if (!user || user.passwordResetToken !== token) {
      this.logger.warn(`Invalid reset token: ${token}`);
      throw new UnauthorizedException('Invalid reset token');
    }

    if (!user.passwordResetExpires || user.passwordResetExpires < new Date()) {
      this.logger.warn(`Expired reset token for user: ${user.email}`);
      throw new UnauthorizedException('Reset token has expired');
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await this.usersService.updateUser(user.id, {
      passwordHash,
      passwordResetToken: undefined,
      passwordResetExpires: undefined,
    });

    this.logger.log(`Password reset successfully for user: ${user.email}`);

    return {
      message: 'Password reset successfully',
    };
  }
}