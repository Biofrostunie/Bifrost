import { IsString, IsNumber, IsBoolean, IsDateString, IsOptional, Min, IsUUID, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PaymentMethod } from '@prisma/client';

export class CreateExpenseDto {
  @ApiProperty({ description: 'Expense description', example: 'Lunch at restaurant' })
  @IsString()
  description!: string;

  @ApiProperty({ description: 'Expense amount', example: 50.99 })
  @IsNumber({}, { message: 'Amount must be a valid number' })
  @Min(0.01, { message: 'Amount must be greater than 0' })
  @Type(() => Number)
  amount!: number;

  @ApiProperty({ description: 'Expense category', example: 'Food' })
  @IsString()
  category!: string;

  @ApiProperty({ description: 'Expense date', example: '2024-01-15' })
  @IsDateString()
  date!: string;

  @ApiPropertyOptional({ description: 'Is this an essential expense?', default: false })
  @IsOptional()
  @IsBoolean()
  essential?: boolean;

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Payment method', enum: PaymentMethod })
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @ApiPropertyOptional({ description: 'Associated bank account ID when applicable' })
  @IsOptional()
  @IsUUID()
  bankAccountId?: string;

  @ApiPropertyOptional({ description: 'Associated credit card ID when applicable' })
  @IsOptional()
  @IsUUID()
  creditCardId?: string;
}