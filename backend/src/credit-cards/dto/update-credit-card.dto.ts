import { IsString, IsOptional, IsNumber, Min, IsUUID, IsInt, Max, Length } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateCreditCardDto {
  @ApiPropertyOptional({ description: 'Issuer (bank or institution) name' })
  @IsOptional()
  @IsString()
  issuer?: string;

  @ApiPropertyOptional({ description: 'Card alias' })
  @IsOptional()
  @IsString()
  alias?: string;

  @ApiPropertyOptional({ description: 'Card brand' })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional({ description: 'Last 4 digits of card number' })
  @IsOptional()
  @IsString()
  @Length(4, 4)
  last4?: string;

  @ApiPropertyOptional({ description: 'Credit limit' })
  @Type(() => Number)
  @Min(0)
  @IsOptional()
  @IsNumber()
  limit?: number;

  @ApiPropertyOptional({ description: 'Current balance' })
  @Type(() => Number)
  @Min(0)
  @IsOptional()
  @IsNumber()
  currentBalance?: number;

  @ApiPropertyOptional({ description: 'Statement day of month' })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(31)
  statementDay?: number;

  @ApiPropertyOptional({ description: 'Due day of month' })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(31)
  dueDay?: number;

  @ApiPropertyOptional({ description: 'Linked bank account ID' })
  @IsOptional()
  @IsUUID()
  bankAccountId?: string;
}