import { IsOptional, IsString, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetConceptsQueryDto {
  @ApiPropertyOptional({ description: 'Filter by category' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ 
    description: 'Filter by difficulty level',
    enum: ['beginner', 'intermediate', 'advanced']
  })
  @IsOptional()
  @IsIn(['beginner', 'intermediate', 'advanced'])
  difficultyLevel?: string;
}