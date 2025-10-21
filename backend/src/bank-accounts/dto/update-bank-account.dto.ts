import { IsString, IsOptional, IsNumber, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateBankAccountDto {
  @ApiPropertyOptional({ description: 'Bank name' })
  @IsOptional()
  @IsString()
  bankName?: string;

  @ApiPropertyOptional({ description: 'Alias for quick identification' })
  @IsOptional()
  @IsString()
  alias?: string;

  @ApiPropertyOptional({ description: 'Account type' })
  @IsOptional()
  @IsString()
  accountType?: string;

  @ApiPropertyOptional({ description: 'Account number (masked)' })
  @IsOptional()
  @IsString()
  accountNumber?: string;

  @ApiPropertyOptional({ description: 'Current balance' })
  @Type(() => Number)
  @Min(0)
  @IsOptional()
  @IsNumber()
  balance?: number;

  @ApiPropertyOptional({ description: 'Currency code' })
  @IsOptional()
  @IsString()
  currency?: string;
}