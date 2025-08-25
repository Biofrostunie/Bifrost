import { IsString, IsArray, IsOptional, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateConceptDto {
  @ApiProperty({ description: 'Concept title', example: 'Compound Interest' })
  @IsString()
  title!: string;

  @ApiProperty({ 
    description: 'Concept description',
    example: 'Compound interest is the interest calculated on the initial principal and also on the accumulated interest...'
  })
  @IsString()
  description!: string;

  @ApiProperty({ description: 'Concept category', example: 'Investments' })
  @IsString()
  category!: string;

  @ApiPropertyOptional({ 
    description: 'Difficulty level',
    enum: ['beginner', 'intermediate', 'advanced'],
    example: 'beginner'
  })
  @IsOptional()
  @IsIn(['beginner', 'intermediate', 'advanced'])
  difficultyLevel?: string;

  @ApiPropertyOptional({ 
    description: 'Tags for the concept',
    example: ['investment', 'savings', 'compound']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}