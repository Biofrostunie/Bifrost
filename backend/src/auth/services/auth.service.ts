import { Injectable, ConflictException, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

import { UsersService } from '../../users/services/users.service';
import { EmailService } from '../../common/services/email.service';
import { SessionService } from '../../redis/session.service';
import { RateLimitService } from '../../redis/rate-limit.service';
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
    private readonly sessionService: SessionService,
    private readonly rateLimitService: RateLimitService,
  ) {}

  async register(registerDto: RegisterDto, context?: AuthContext) {
    this.logger.log(`Registration attempt for email: ${registerDto.email}`);
    
    // Check rate limit for registration
    if (context?.ip) {
      const rateLimitResult = await this.rateLimitService.checkRateLimit(
        `register:${context.ip}`,
        {
          windowMs: 15 * 60 * 1000, // 15 minutes
          maxRequests: 5, // 5 registrations per 15 minutes per IP
        }
      );

      if (!rateLimitResult.allowed) {
        throw new UnauthorizedException('Too many registration attempts. Please try again later.');
      }
    }
    
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
    
    // Check rate limit for login
    if (context?.ip) {
      const rateLimitResult = await this.rateLimitService.checkRateLimit(
        `login:${context.ip}`,
        {
          windowMs: 15 * 60 * 1000, // 15 minutes
          maxRequests: 10, // 10 login attempts per 15 minutes per IP
        }
      );

      if (!rateLimitResult.allowed) {
        throw new UnauthorizedException('Too many login attempts. Please try again later.');
      }
    }
    
    // Payload simples sem duplicação de campos
    const payload = { 
      email: user.email, 
      sub: user.id,
    };
    
    const accessToken = this.jwtService.sign(payload);
    
    // Create session
    try {
      await this.sessionService.createSession(accessToken, {
        userId: user.id,
        email: user.email,
        fullName: user.fullName,
        isEmailVerified: user.isEmailVerified || false,
        loginAt: new Date(),
        lastActivity: new Date(),
        ipAddress: context?.ip,
      });
    } catch (error) {
      this.logger.warn(`Failed to create session for user ${user.email}:`, error);
      // Don't fail login if session creation fails
    }
    
    return {
      access_token: accessToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
      },
    };
  }

  async logout(token: string) {
    try {
      await this.sessionService.deleteSession(token);
      this.logger.log(`Session deleted for token: ${token.substring(0, 10)}...`);
    } catch (error) {
      this.logger.warn(`Failed to delete session:`, error);
    }
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

    // Invalidate all sessions for this user
    try {
      await this.sessionService.deleteUserSessions(user.id);
      this.logger.log(`All sessions invalidated for user: ${user.email}`);
    } catch (error) {
      this.logger.warn(`Failed to invalidate sessions for user ${user.email}:`, error);
    }

    this.logger.log(`Password reset successfully for user: ${user.email}`);

    return {
      message: 'Password reset successfully',
    };
  }
}