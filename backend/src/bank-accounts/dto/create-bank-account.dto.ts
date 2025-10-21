import { IsString, IsOptional, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateBankAccountDto {
  @ApiProperty({ description: 'Bank name', example: 'Banco do Brasil' })
  @IsString()
  bankName!: string;

  @ApiPropertyOptional({ description: 'Alias for quick identification', example: 'Conta Principal' })
  @IsOptional()
  @IsString()
  alias?: string;

  @ApiPropertyOptional({ description: 'Account type', example: 'checking' })
  @IsOptional()
  @IsString()
  accountType?: string;

  @ApiPropertyOptional({ description: 'Account number (masked)', example: '1234-5' })
  @IsOptional()
  @IsString()
  accountNumber?: string;

  @ApiProperty({ description: 'Current balance', example: 2500.00 })
  @Type(() => Number)
  @Min(0)
  @IsNumber()
  balance!: number;

  @ApiPropertyOptional({ description: 'Currency code', example: 'BRL' })
  @IsOptional()
  @IsString()
  currency?: string;
}