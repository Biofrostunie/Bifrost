import { IsOptional, IsString, IsEmail, IsBoolean, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({ description: 'User full name' })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({ description: 'User email address' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: 'User phone number' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'User address' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: 'Password hash' })
  @IsOptional()
  @IsString()
  passwordHash?: string;

  @ApiPropertyOptional({ description: 'Email verification status' })
  @IsOptional()
  @IsBoolean()
  isEmailVerified?: boolean;

  @ApiPropertyOptional({ description: 'Email verification token' })
  @IsOptional()
  @IsString()
  emailVerificationToken?: string;

  @ApiPropertyOptional({ description: 'Password reset token' })
  @IsOptional()
  @IsString()
  passwordResetToken?: string;

  @ApiPropertyOptional({ description: 'Password reset expiration' })
  @IsOptional()
  @IsDateString()
  passwordResetExpires?: Date;
}