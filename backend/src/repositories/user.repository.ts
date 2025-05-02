import { PrismaClient } from '@prisma/client';
import { UserInput, UserOutput, UserUpdateInput } from '../types';
import { hashPassword } from '../utils/password';

export class UserRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Create a new user
   */
  async create(userData: UserInput): Promise<UserOutput> {
    const hashedPassword = await hashPassword(userData.password);

    const user = await this.prisma.user.create({
      data: {
        email: userData.email,
        password: hashedPassword,
        name: userData.name,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<UserOutput | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<(UserOutput & { password: string }) | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    return user;
  }

  /**
   * Update user
   */
  async update(id: string, data: UserUpdateInput): Promise<UserOutput> {
    const user = await this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  /**
   * Update user password
   */
  async updatePassword(id: string, password: string): Promise<void> {
    const hashedPassword = await hashPassword(password);

    await this.prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });
  }

  /**
   * Delete user
   */
  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    });
  }
}