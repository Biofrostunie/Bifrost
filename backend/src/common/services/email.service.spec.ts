import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

import { EmailService } from './email.service';
import { CacheService } from '../../redis/cache.service';

// Mock nodemailer
jest.mock('nodemailer');
const mockedNodemailer = nodemailer as jest.Mocked<typeof nodemailer>;

describe('EmailService', () => {
  let service: EmailService;
  let configService: jest.Mocked<ConfigService>;
  let cacheService: jest.Mocked<CacheService>;
  let mockTransporter: jest.Mocked<any>;

  beforeEach(async () => {
    mockTransporter = {
      sendMail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' }),
    };

    // Mock nodemailer.createTransport BEFORE creating the service
    mockedNodemailer.createTransport.mockReturnValue(mockTransporter);

    const mockConfigService = {
      get: jest.fn(),
    };

    const mockCacheService = {
      exists: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: CacheService,
          useValue: mockCacheService,
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
    configService = module.get(ConfigService);
    cacheService = module.get(CacheService);

    // Setup default config values with correct SMTP settings
    configService.get.mockImplementation((key: string) => {
      const config = {
        SMTP_HOST: 'smtp.test.com',
        SMTP_PORT: 465,
        SMTP_SECURE: true,
        SMTP_USER: 'test@test.com',
        SMTP_PASS: 'test-password',
        EMAIL_FROM: 'noreply@test.com',
        EMAIL_FROM_NAME: 'Test Platform',
        FRONTEND_URL: 'http://localhost:80',
      };
      return config[key as keyof typeof config];
    });

    // Setup default cache service mocks
    cacheService.exists.mockResolvedValue(false);
    cacheService.set.mockResolvedValue(undefined);
    cacheService.del.mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendVerificationEmail', () => {
    it('should send verification email successfully', async () => {
      await service.sendVerificationEmail('test@example.com', 'Test User', 'verification-token');

      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: 'Test Platform <noreply@test.com>',
        to: 'test@example.com',
        subject: 'Confirme sua conta - Bifröst Education Platform',
        html: expect.stringContaining('Test User'),
      });
    });

    it('should handle email sending failure', async () => {
      mockTransporter.sendMail.mockRejectedValue(new Error('SMTP Error'));

      await expect(
        service.sendVerificationEmail('test@example.com', 'Test User', 'token'),
      ).rejects.toThrow('Failed to send verification email');
    });

    it('should include verification URL in email', async () => {
      await service.sendVerificationEmail('test@example.com', 'Test User', 'test-token');

      const callArgs = mockTransporter.sendMail.mock.calls[0][0];
      expect(callArgs.html).toContain('http://localhost:80/verify-email?token=test-token');
    });

    it('should handle missing user name', async () => {
      await service.sendVerificationEmail('test@example.com', '', 'token');

      const callArgs = mockTransporter.sendMail.mock.calls[0][0];
      expect(callArgs.html).toContain('Olá ,'); // Empty name
    });
  });

  describe('sendPasswordResetEmail', () => {
    it('should send password reset email successfully', async () => {
      await service.sendPasswordResetEmail('test@example.com', 'Test User', '12345');

      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: 'Test Platform <noreply@test.com>',
        to: 'test@example.com',
        subject: 'Redefinição de Senha - Bifröst Education Platform',
        html: expect.stringContaining('12345'),
      });
    });

    it('should handle password reset email failure', async () => {
      mockTransporter.sendMail.mockRejectedValue(new Error('Network Error'));

      await expect(
        service.sendPasswordResetEmail('test@example.com', 'Test User', '12345'),
      ).rejects.toThrow('Failed to send password reset email');
    });

    it('should include reset code in email', async () => {
      await service.sendPasswordResetEmail('test@example.com', 'Test User', '54321');

      const callArgs = mockTransporter.sendMail.mock.calls[0][0];
      expect(callArgs.html).toContain('54321');
    });

    it('should handle missing user name in reset email', async () => {
      await service.sendPasswordResetEmail('test@example.com', '', '12345');

      const callArgs = mockTransporter.sendMail.mock.calls[0][0];
      expect(callArgs.html).toContain('Olá ,'); // Empty name
    });

    it('should include expiration warning', async () => {
      await service.sendPasswordResetEmail('test@example.com', 'Test User', '12345');

      const callArgs = mockTransporter.sendMail.mock.calls[0][0];
      expect(callArgs.html).toContain('Este código expira em 1 hora');
    });
  });


});