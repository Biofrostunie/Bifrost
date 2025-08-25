import { IsOptional, IsString, IsArray, IsIn, IsNumber, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateProfileDto {
  @ApiPropertyOptional({ 
    description: 'Monthly income',
    type: 'number',
    example: 5000.00
  })
  @IsOptional()
  @IsNumber({}, { message: 'Monthly income must be a valid number' })
  @Min(0, { message: 'Monthly income must be zero or positive' })
  @Type(() => Number)
  monthlyIncome?: number;

  @ApiPropertyOptional({ 
    description: 'Financial goals',
    type: [String],
    example: ['retirement', 'house', 'emergency_fund']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  financialGoals?: string[];

  @ApiPropertyOptional({ 
    description: 'Risk tolerance level',
    enum: ['conservative', 'moderate', 'aggressive'],
    example: 'moderate'
  })
  @IsOptional()
  @IsIn(['conservative', 'moderate', 'aggressive'])
  riskTolerance?: string;
}