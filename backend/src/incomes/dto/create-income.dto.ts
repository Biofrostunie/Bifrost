import { IsString, IsNumber, IsBoolean, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateIncomeDto {
  @ApiProperty({ description: 'Income source', example: 'Salary' })
  @IsString()
  source!: string;

  @ApiProperty({ description: 'Income amount', example: 3000.00 })
  @IsNumber({}, { message: 'Amount must be a valid number' })
  @Min(0.01, { message: 'Amount must be greater than 0' })
  @Type(() => Number)
  amount!: number;

  @ApiPropertyOptional({ description: 'Is this a recurrent income?', default: false })
  @IsOptional()
  @IsBoolean()
  recurrent?: boolean;

  @ApiPropertyOptional({ description: 'Income description', example: 'Monthly salary from company XYZ' })
  @IsOptional()
  @IsString()
  description?: string;
}