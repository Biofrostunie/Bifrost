import { IsString, IsNumber, IsBoolean, IsOptional, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateIncomeDto {
  @ApiPropertyOptional({ description: 'Income source' })
  @IsOptional()
  @IsString()
  source?: string;

  @ApiPropertyOptional({ description: 'Income amount' })
  @IsOptional()
  @IsNumber({}, { message: 'Amount must be a valid number' })
  @Min(0.01, { message: 'Amount must be greater than 0' })
  @Type(() => Number)
  amount?: number;

  @ApiPropertyOptional({ description: 'Is this a recurrent income?' })
  @IsOptional()
  @IsBoolean()
  recurrent?: boolean;

  @ApiPropertyOptional({ description: 'Income description' })
  @IsOptional()
  @IsString()
  description?: string;
}