import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class UsersRepository {
  private readonly logger = new Logger(UsersRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    return this.prisma.user.create({
      data: createUserDto,
    });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findByEmailVerificationToken(token: string) {
    return this.prisma.user.findFirst({
      where: { emailVerificationToken: token },
    });
  }

  async findByPasswordResetToken(token: string) {
    return this.prisma.user.findFirst({
      where: { passwordResetToken: token },
    });
  }

  async findByIdWithProfile(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
      },
    });
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    const data: any = {
      ...updateProfileDto,
    };

    // Convert monthlyIncome to Decimal if provided
    if (updateProfileDto.monthlyIncome !== undefined) {
      data.monthlyIncome = new Decimal(updateProfileDto.monthlyIncome);
    }

    return this.prisma.userProfile.upsert({
      where: { userId },
      update: data,
      create: {
        userId,
        ...data,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
            phone: true,
            address: true,
            isEmailVerified: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });
  }

  async updateUser(userId: string, updateUserDto: UpdateUserDto) {
    // Filter out undefined values to avoid overwriting with undefined
    const filteredData = Object.fromEntries(
      Object.entries(updateUserDto).filter(([_, value]) => value !== undefined)
    );

    return this.prisma.user.update({
      where: { id: userId },
      data: filteredData,
    });
  }

  async deleteUser(userId: string) {
    return this.prisma.user.delete({
      where: { id: userId },
    });
  }
}