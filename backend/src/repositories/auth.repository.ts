import { PrismaClient } from '@prisma/client';
import { ResetPasswordToken } from '../types';
import { generateResetToken } from '../utils/password';

export class AuthRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Create a password reset token
   */
  async createResetToken(userId: string): Promise<ResetPasswordToken> {
    // Delete any existing token for the user
    await this.prisma.resetPasswordToken.deleteMany({
      where: { userId },
    });

    // Generate a new token
    const token = generateResetToken();
    
    // Set expiry date (1 hour from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    // Create token record
    const resetToken = await this.prisma.resetPasswordToken.create({
      data: {
        token,
        expiresAt,
        userId,
      },
    });

    return resetToken;
  }

  /**
   * Get a password reset token by token value
   */
  async getResetToken(token: string): Promise<ResetPasswordToken | null> {
    const resetToken = await this.prisma.resetPasswordToken.findUnique({
      where: { token },
    });

    return resetToken;
  }

  /**
   * Delete a password reset token
   */
  async deleteResetToken(token: string): Promise<void> {
    await this.prisma.resetPasswordToken.delete({
      where: { token },
    });
  }
}