import { IsString, IsNumber, IsOptional, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateSimulationDto {
  @ApiPropertyOptional({ description: 'Initial investment amount' })
  @IsOptional()
  @IsNumber({}, { message: 'Initial amount must be a valid number' })
  @Min(0, { message: 'Initial amount must be zero or positive' })
  @Type(() => Number)
  initialAmount?: number;

  @ApiPropertyOptional({ description: 'Monthly contribution amount' })
  @IsOptional()
  @IsNumber({}, { message: 'Monthly contribution must be a valid number' })
  @Min(0, { message: 'Monthly contribution must be zero or positive' })
  @Type(() => Number)
  monthlyContribution?: number;

  @ApiPropertyOptional({ description: 'Annual return rate (%)' })
  @IsOptional()
  @IsNumber({}, { message: 'Annual return rate must be a valid number' })
  @Min(0, { message: 'Annual return rate must be positive' })
  @Max(100, { message: 'Annual return rate must not exceed 100%' })
  @Type(() => Number)
  annualReturnRate?: number;

  @ApiPropertyOptional({ description: 'Investment time period (months)' })
  @IsOptional()
  @IsNumber({}, { message: 'Time period must be a valid number' })
  @Min(1, { message: 'Time period must be at least 1 month' })
  @Max(1200, { message: 'Time period must not exceed 1200 months (100 years)' })
  @Type(() => Number)
  timePeriodMonths?: number;

  @ApiPropertyOptional({ description: 'Simulation name' })
  @IsOptional()
  @IsString()
  simulationName?: string;
}