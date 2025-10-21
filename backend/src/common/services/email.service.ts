import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { CacheService } from '../../redis/cache.service';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  // Cooldown para limitar reenvio (2 minutos)
  private readonly sendCooldownSeconds = 120;
  // TTL para código de reset de senha (1 hora)
  private readonly passwordResetTokenTTLSeconds = 3600;

  constructor(
    private readonly configService: ConfigService,
    private readonly cacheService: CacheService,
  ) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST'),
      port: this.configService.get<number>('SMTP_PORT'),
      secure: this.configService.get<boolean>('SMTP_SECURE'),
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    });
  }

  private getVerificationCooldownKey(email: string): string {
    return `email-verification-cooldown:${email}`;
  }

  private getResetCooldownKey(email: string): string {
    return `password-reset-cooldown:${email}`;
  }

  private getResetTokenKey(email: string): string {
    return `password-reset-token:${email}`;
  }

  private async checkAndSetCooldown(cacheKey: string, ttlSeconds: number): Promise<void> {
    const exists = await this.cacheService.exists(cacheKey);
    if (exists) {
      throw new BadRequestException('Solicitação bloqueada: aguarde antes de tentar novamente.');
    }
    await this.cacheService.set(cacheKey, true, { ttl: ttlSeconds });
  }

  async sendVerificationEmail(email: string, name: string, token: string): Promise<void> {
    const cooldownKey = this.getVerificationCooldownKey(email);

    await this.checkAndSetCooldown(cooldownKey, this.sendCooldownSeconds);

    try {
      // Usa FRONTEND_URL do .env e normaliza removendo barras finais para evitar //verify-email
      const baseUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:8080');
      const normalizedBaseUrl = baseUrl.replace(/\/+$/, '');
      const verificationUrl = `${normalizedBaseUrl}/verify-email?token=${token}`;

      const mailOptions = {
        from: `${this.configService.get('EMAIL_FROM_NAME')} <${this.configService.get('EMAIL_FROM')}>`,
        to: email,
        subject: 'Confirme sua conta - Bifröst Education Platform',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #667eea;">Bem-vindo à Bifröst Education Platform!</h2>
            <p>Olá ${name},</p>
            <p>Obrigado por se registrar na nossa plataforma de educação financeira. Para ativar sua conta, clique no botão abaixo:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" style="background-color: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Confirmar E-mail
              </a>
            </div>
            <p>Ou copie e cole este link no seu navegador:</p>
            <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
            <p>Se você não criou esta conta, pode ignorar este e-mail.</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px;">
              Este e-mail foi enviado automaticamente pela Bifröst Education Platform.<br>
              Por favor, não responda a este e-mail.
            </p>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Verification email sent to ${email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send verification email to ${email}: ${error instanceof Error ? error.message : error}`,
      );
      await this.cacheService.del(cooldownKey);
      throw new Error('Failed to send verification email');
    }
  }

  async sendPasswordResetEmail(email: string, name: string, resetCode: string): Promise<void> {
    const cooldownKey = this.getResetCooldownKey(email);
    const tokenKey = this.getResetTokenKey(email);

    await this.checkAndSetCooldown(cooldownKey, this.sendCooldownSeconds);

    const mailOptions = {
      from: `${this.configService.get('EMAIL_FROM_NAME')} <${this.configService.get('EMAIL_FROM')}>`,
      to: email,
      subject: 'Redefinição de Senha - Bifröst Education Platform',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #667eea;">Redefinição de Senha</h2>
          <p>Olá ${name},</p>
          <p>Você solicitou a redefinição da sua senha na Bifröst Education Platform.</p>
          <p>Use o código abaixo para redefinir sua senha:</p>
          <div style="text-align: center; margin: 30px 0;">
            <div style="background-color: #f8f9fa; border: 2px solid #667eea; padding: 20px; border-radius: 8px; display: inline-block;">
              <span style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px;">${resetCode}</span>
            </div>
          </div>
          <p><strong>Este código expira em 1 hora.</strong></p>
          <p>Se você não solicitou esta redefinição, pode ignorar este e-mail com segurança.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            Este e-mail foi enviado automaticamente pela Bifröst Education Platform.<br>
            Por favor, não responda a este e-mail.
          </p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Password reset email sent to ${email}`);

      // Armazena o código de reset no cache para validação futura
      await this.cacheService.set(tokenKey, resetCode, { ttl: this.passwordResetTokenTTLSeconds });
    } catch (error) {
      this.logger.error(
        `Failed to send password reset email to ${email}: ${error instanceof Error ? error.message : error}`,
      );
      await this.cacheService.del(cooldownKey);
      throw new Error('Failed to send password reset email');
    }
  }

  // Opcional: método para validar o código de reset no Redis
  async validateResetCode(email: string, code: string): Promise<boolean> {
    const tokenKey = this.getResetTokenKey(email);
    const cachedCode = await this.cacheService.get(tokenKey);
    return cachedCode === code;
  }
}