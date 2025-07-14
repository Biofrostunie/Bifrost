import { IsOptional, IsDateString, IsString, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';

export class GetExpensesQueryDto {
  @ApiPropertyOptional({ 
    description: 'Start date filter (YYYY-MM-DD)',
    example: '2024-01-01'
  })
  @IsOptional()
  @IsDateString({}, { message: 'Start date must be a valid date in YYYY-MM-DD format' })
  startDate?: string;

  @ApiPropertyOptional({ 
    description: 'End date filter (YYYY-MM-DD)',
    example: '2024-12-31'
  })
  @IsOptional()
  @IsDateString({}, { message: 'End date must be a valid date in YYYY-MM-DD format' })
  endDate?: string;

  @ApiPropertyOptional({ 
    description: 'Category filter',
    example: 'Food'
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  category?: string;

  @ApiPropertyOptional({ 
    description: 'Filter by essential expenses',
    example: true
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  @IsBoolean()
  essential?: boolean;
}