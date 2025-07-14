import { IsString, IsArray, IsOptional, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateConceptDto {
  @ApiPropertyOptional({ description: 'Concept title' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Concept description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Concept category' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ 
    description: 'Difficulty level',
    enum: ['beginner', 'intermediate', 'advanced']
  })
  @IsOptional()
  @IsIn(['beginner', 'intermediate', 'advanced'])
  difficultyLevel?: string;

  @ApiPropertyOptional({ description: 'Tags for the concept' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}