import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

import { AuthService } from './auth.service';
import { UsersService } from '../../users/services/users.service';
import { EmailService } from '../../common/services/email.service';
import { SessionService } from '../../redis/session.service';
import { RateLimitService } from '../../redis/rate-limit.service';

// Mock bcrypt
jest.mock('bcryptjs');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

// Mock crypto
jest.mock('crypto');
const mockedCrypto = crypto as jest.Mocked<typeof crypto>;

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;
  let emailService: jest.Mocked<EmailService>;

  const mockUser = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    passwordHash: 'hashedPassword',
    fullName: 'Test User',
    phone: null,
    address: null,
    isEmailVerified: true,
    emailVerificationToken: 'token123',
    passwordResetToken: null,
    passwordResetExpires: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUpdatedUser = {
    ...mockUser,
    isEmailVerified: true,
    emailVerificationToken: null,
  };

  beforeEach(async () => {
    const mockUsersService = {
      findByEmail: jest.fn(),
      create: jest.fn(),
      findById: jest.fn(),
      updateUser: jest.fn(),
      findByEmailVerificationToken: jest.fn(),
      findByPasswordResetToken: jest.fn(),
    };

    const mockJwtService = {
      sign: jest.fn(),
    };

    const mockEmailService = {
      sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
      sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
    };

    const mockSessionService = {
      createSession: jest.fn().mockResolvedValue('session-id'),
      invalidateSession: jest.fn().mockResolvedValue(undefined),
      getSession: jest.fn().mockResolvedValue({ userId: 'user-id' }),
    };

    const mockRateLimitService = {
      checkRateLimit: jest.fn().mockResolvedValue({ allowed: true }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
        {
          provide: SessionService,
          useValue: mockSessionService,
        },
        {
          provide: RateLimitService,
          useValue: mockRateLimitService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
    emailService = module.get(EmailService);

    // Setup default mocks
    mockedBcrypt.hash.mockResolvedValue('hashedPassword' as never);
    mockedBcrypt.compare.mockResolvedValue(true as never);
    
    // Mock crypto.randomBytes
    const mockRandomBytes = {
      toString: jest.fn().mockReturnValue('mocked-random-string'),
    };
    mockedCrypto.randomBytes.mockReturnValue(mockRandomBytes as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const registerDto = {
      email: 'test@example.com',
      password: 'password123',
      fullName: 'Test User',
    };

    it('should register a new user successfully', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      usersService.create.mockResolvedValue(mockUser);

      const result = await service.register(registerDto);

      expect(usersService.findByEmail).toHaveBeenCalledWith(registerDto.email);
      expect(mockedBcrypt.hash).toHaveBeenCalledWith(registerDto.password, 12);
      expect(usersService.create).toHaveBeenCalledWith({
        email: registerDto.email,
        passwordHash: 'hashedPassword',
        fullName: registerDto.fullName,
        emailVerificationToken: 'mocked-random-string',
      });
      expect(emailService.sendVerificationEmail).toHaveBeenCalled();
      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        fullName: mockUser.fullName,
        isEmailVerified: mockUser.isEmailVerified,
      });
    });

    it('should throw ConflictException if user already exists', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
      expect(usersService.findByEmail).toHaveBeenCalledWith(registerDto.email);
      expect(usersService.create).not.toHaveBeenCalled();
    });

    it('should register user even if email sending fails', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      usersService.create.mockResolvedValue(mockUser);
      emailService.sendVerificationEmail.mockRejectedValue(new Error('Email failed'));

      const result = await service.register(registerDto);

      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        fullName: mockUser.fullName,
        isEmailVerified: mockUser.isEmailVerified,
      });
    });
  });

  describe('validateUser', () => {
    it('should return user without password if credentials are valid', async () => {
      const email = 'test@example.com';
      const password = 'password123';

      usersService.findByEmail.mockResolvedValue(mockUser);

      const result = await service.validateUser(email, password);

      expect(usersService.findByEmail).toHaveBeenCalledWith(email);
      expect(mockedBcrypt.compare).toHaveBeenCalledWith(password, mockUser.passwordHash);
      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        fullName: mockUser.fullName,
        phone: mockUser.phone,
        address: mockUser.address,
        isEmailVerified: mockUser.isEmailVerified,
        emailVerificationToken: mockUser.emailVerificationToken,
        passwordResetToken: mockUser.passwordResetToken,
        passwordResetExpires: mockUser.passwordResetExpires,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });
    });

    it('should return null if user does not exist', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      const result = await service.validateUser('test@example.com', 'password123');

      expect(result).toBeNull();
      expect(mockedBcrypt.compare).not.toHaveBeenCalled();
    });

    it('should return null if password is invalid', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(false as never);

      const result = await service.validateUser('test@example.com', 'wrongpassword');

      expect(result).toBeNull();
      expect(mockedBcrypt.compare).toHaveBeenCalledWith('wrongpassword', mockUser.passwordHash);
    });
  });

  describe('login', () => {
    const currentUser = {
      id: mockUser.id,
      email: mockUser.email,
      fullName: mockUser.fullName,
      isEmailVerified: true,
    };

    it('should return access token and user info', async () => {
      const accessToken = 'jwt-token';
      jwtService.sign.mockReturnValue(accessToken);

      const result = await service.login(currentUser);

      expect(jwtService.sign).toHaveBeenCalledWith({
        email: currentUser.email,
        sub: currentUser.id,
      });
      expect(result).toEqual({
        access_token: accessToken,
        user: {
          id: currentUser.id,
          email: currentUser.email,
          fullName: currentUser.fullName,
        },
      });
    });
  });

  describe('verifyEmail', () => {
    it('should verify email successfully', async () => {
      const token = 'verification-token';
      const userWithToken = { ...mockUser, emailVerificationToken: token };

      usersService.findByEmailVerificationToken.mockResolvedValue(userWithToken);
      usersService.updateUser.mockResolvedValue(mockUpdatedUser);

      const result = await service.verifyEmail(token);

      expect(usersService.findByEmailVerificationToken).toHaveBeenCalledWith(token);
      expect(usersService.updateUser).toHaveBeenCalledWith(mockUser.id, {
        isEmailVerified: true,
        emailVerificationToken: undefined,
      });
      expect(result).toEqual({
        message: 'Email verified successfully',
        user: {
          id: mockUpdatedUser.id,
          email: mockUpdatedUser.email,
          fullName: mockUpdatedUser.fullName,
          isEmailVerified: mockUpdatedUser.isEmailVerified,
        },
      });
    });

    it('should throw UnauthorizedException for invalid token', async () => {
      usersService.findByEmailVerificationToken.mockResolvedValue(null);

      await expect(service.verifyEmail('invalid-token')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for mismatched token', async () => {
      const userWithDifferentToken = { ...mockUser, emailVerificationToken: 'different-token' };
      usersService.findByEmailVerificationToken.mockResolvedValue(userWithDifferentToken);

      await expect(service.verifyEmail('invalid-token')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('forgotPassword', () => {
    it('should send password reset email', async () => {
      const email = 'test@example.com';
      usersService.findByEmail.mockResolvedValue(mockUser);
      usersService.updateUser.mockResolvedValue(mockUser);

      const result = await service.forgotPassword(email);

      expect(usersService.findByEmail).toHaveBeenCalledWith(email);
      expect(usersService.updateUser).toHaveBeenCalledWith(mockUser.id, {
        passwordResetToken: expect.any(String),
        passwordResetExpires: expect.any(Date),
      });
      expect(emailService.sendPasswordResetEmail).toHaveBeenCalled();
      expect(result).toEqual({
        message: 'Password reset code sent to your email',
      });
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(service.forgotPassword('nonexistent@example.com')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw error if email sending fails', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);
      usersService.updateUser.mockResolvedValue(mockUser);
      emailService.sendPasswordResetEmail.mockRejectedValue(new Error('Email failed'));

      await expect(service.forgotPassword('test@example.com')).rejects.toThrow('Failed to send password reset email');
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      const resetDto = {
        token: '12345',
        newPassword: 'newpassword123',
      };

      const userWithResetToken = {
        ...mockUser,
        passwordResetToken: '12345',
        passwordResetExpires: new Date(Date.now() + 3600000), // 1 hour from now
      };

      usersService.findByPasswordResetToken.mockResolvedValue(userWithResetToken);
      usersService.updateUser.mockResolvedValue(mockUser);

      const result = await service.resetPassword(resetDto);

      expect(usersService.findByPasswordResetToken).toHaveBeenCalledWith(resetDto.token);
      expect(mockedBcrypt.hash).toHaveBeenCalledWith(resetDto.newPassword, 12);
      expect(usersService.updateUser).toHaveBeenCalledWith(userWithResetToken.id, {
        passwordHash: 'hashedPassword',
        passwordResetToken: undefined,
        passwordResetExpires: undefined,
      });
      expect(result).toEqual({
        message: 'Password reset successfully',
      });
    });

    it('should throw UnauthorizedException for invalid token', async () => {
      usersService.findByPasswordResetToken.mockResolvedValue(null);

      await expect(service.resetPassword({
        token: 'invalid',
        newPassword: 'newpassword',
      })).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for mismatched token', async () => {
      const userWithDifferentToken = {
        ...mockUser,
        passwordResetToken: 'different-token',
        passwordResetExpires: new Date(Date.now() + 3600000),
      };

      usersService.findByPasswordResetToken.mockResolvedValue(userWithDifferentToken);

      await expect(service.resetPassword({
        token: 'invalid',
        newPassword: 'newpassword',
      })).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for expired token', async () => {
      const userWithExpiredToken = {
        ...mockUser,
        passwordResetToken: '12345',
        passwordResetExpires: new Date(Date.now() - 3600000), // 1 hour ago
      };

      usersService.findByPasswordResetToken.mockResolvedValue(userWithExpiredToken);

      await expect(service.resetPassword({
        token: '12345',
        newPassword: 'newpassword',
      })).rejects.toThrow(UnauthorizedException);
    });
  });
});