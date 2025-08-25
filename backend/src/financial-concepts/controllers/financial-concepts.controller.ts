import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

import { FinancialConceptsService } from '../services/financial-concepts.service';
import { CreateConceptDto } from '../dto/create-concept.dto';
import { UpdateConceptDto } from '../dto/update-concept.dto';
import { GetConceptsQueryDto } from '../dto/get-concepts-query.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('Financial Concepts')
@Controller('financial-concepts')
export class FinancialConceptsController {
  constructor(private readonly conceptsService: FinancialConceptsService) {}

  @ApiOperation({ summary: 'Get all financial concepts' })
  @ApiResponse({ status: 200, description: 'Concepts retrieved successfully' })
  @ApiQuery({ name: 'category', required: false, description: 'Filter by category' })
  @ApiQuery({ name: 'difficultyLevel', required: false, description: 'Filter by difficulty level' })
  @Get()
  async getConcepts(@Query() query: GetConceptsQueryDto) {
    return this.conceptsService.getConcepts(query);
  }

  @ApiOperation({ summary: 'Get popular financial concepts' })
  @ApiResponse({ status: 200, description: 'Popular concepts retrieved successfully' })
  @ApiQuery({ name: 'limit', required: false, description: 'Limit number of results' })
  @Get('popular')
  async getPopularConcepts(@Query('limit') limit?: number) {
    return this.conceptsService.getPopularConcepts(limit);
  }

  @ApiOperation({ summary: 'Get concept by ID' })
  @ApiResponse({ status: 200, description: 'Concept retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Concept not found' })
  @Get(':id')
  async getConceptById(@Param('id') id: string) {
    return this.conceptsService.getConceptById(id);
  }

  @ApiOperation({ summary: 'Create new financial concept' })
  @ApiResponse({ status: 201, description: 'Concept created successfully' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Post()
  async createConcept(@Body() createConceptDto: CreateConceptDto) {
    return this.conceptsService.createConcept(createConceptDto);
  }

  @ApiOperation({ summary: 'Update financial concept' })
  @ApiResponse({ status: 200, description: 'Concept updated successfully' })
  @ApiResponse({ status: 404, description: 'Concept not found' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updateConcept(
    @Param('id') id: string,
    @Body() updateConceptDto: UpdateConceptDto,
  ) {
    return this.conceptsService.updateConcept(id, updateConceptDto);
  }

  @ApiOperation({ summary: 'Delete financial concept' })
  @ApiResponse({ status: 200, description: 'Concept deleted successfully' })
  @ApiResponse({ status: 404, description: 'Concept not found' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteConcept(@Param('id') id: string) {
    return this.conceptsService.deleteConcept(id);
  }
}