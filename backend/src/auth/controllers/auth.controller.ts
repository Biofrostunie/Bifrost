import { 
  Controller, 
  Post, 
  Body, 
  UseGuards, 
  HttpCode, 
  HttpStatus,
  Version,
  Ip,
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiTooManyRequestsResponse,
} from '@nestjs/swagger';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';

import { AuthService } from '../services/auth.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { VerifyEmailDto } from '../dto/verify-email.dto';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { CurrentUser, CurrentUserType } from '../../common/decorators/current-user.decorator';

@ApiTags('Authentication')
@Controller({ path: 'auth', version: '1' })
@UseGuards(ThrottlerGuard)
@ApiTooManyRequestsResponse({ description: 'Rate limit exceeded' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ 
    summary: 'Register a new user',
    description: 'Creates a new user account and sends email verification',
  })
  @ApiResponse({ 
    status: 201, 
    description: 'User successfully registered',
    schema: {
      example: {
        success: true,
        data: {
          id: 'uuid',
          email: 'user@example.com',
          fullName: 'John Doe',
          isEmailVerified: false,
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 registrations per minute
  @Post('register')
  async register(
    @Body() registerDto: RegisterDto,
    @Ip() ip: string,
  ) {
    return this.authService.register(registerDto, { ip });
  }

  @ApiOperation({ 
    summary: 'Verify email address',
    description: 'Verifies user email using the token sent via email',
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Email verified successfully',
    schema: {
      example: {
        success: true,
        data: {
          message: 'Email verified successfully',
          user: {
            id: 'uuid',
            email: 'user@example.com',
            isEmailVerified: true,
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid verification token' })
  @HttpCode(HttpStatus.OK)
  @Post('verify-email')
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    return this.authService.verifyEmail(verifyEmailDto.token);
  }

  @ApiOperation({ 
    summary: 'Login user',
    description: 'Authenticates user and returns JWT token',
  })
  @ApiResponse({ 
    status: 200, 
    description: 'User successfully logged in',
    schema: {
      example: {
        success: true,
        data: {
          access_token: 'jwt-token',
          user: {
            id: 'uuid',
            email: 'user@example.com',
            fullName: 'John Doe',
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 login attempts per minute
  @Post('login')
  async login(
    @Body() loginDto: LoginDto, 
    @CurrentUser() user: CurrentUserType,
    @Ip() ip: string,
  ) {
    return this.authService.login(user, { ip });
  }

  @ApiOperation({ 
    summary: 'Request password reset',
    description: 'Sends a 5-digit reset code to user email',
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Password reset code sent',
    schema: {
      example: {
        success: true,
        data: {
          message: 'Password reset code sent to your email',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'User not found' })
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 password reset requests per minute
  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @ApiOperation({ 
    summary: 'Reset password with token',
    description: 'Resets user password using the 5-digit code',
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Password reset successfully',
    schema: {
      example: {
        success: true,
        data: {
          message: 'Password reset successfully',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid or expired token' })
  @HttpCode(HttpStatus.OK)
  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }
}