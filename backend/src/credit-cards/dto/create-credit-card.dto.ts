import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, IsUUID, IsInt, Max, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateCreditCardDto {
  @ApiProperty({ description: 'Issuer (bank or institution) name' })
  @IsString()
  @IsNotEmpty()
  issuer!: string;

  @ApiPropertyOptional({ description: 'Card alias' })
  @IsOptional()
  @IsString()
  alias?: string;

  @ApiPropertyOptional({ description: 'Card brand (Visa, Mastercard, etc.)' })
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

  @ApiPropertyOptional({ description: 'Statement day of month (1-31)' })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(31)
  statementDay?: number;

  @ApiPropertyOptional({ description: 'Due day of month (1-31)' })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(31)
  dueDay?: number;

  @ApiPropertyOptional({ description: 'Linked bank account ID (optional)' })
  @IsOptional()
  @IsUUID()
  bankAccountId?: string;
}