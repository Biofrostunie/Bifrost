import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { IncomesService } from '../services/incomes.service';
import { CreateIncomeDto } from '../dto/create-income.dto';
import { UpdateIncomeDto } from '../dto/update-income.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserType } from '../../common/decorators/current-user.decorator';

@ApiTags('Incomes')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('incomes')
export class IncomesController {
  constructor(private readonly incomesService: IncomesService) {}

  @ApiOperation({ summary: 'Get user incomes' })
  @ApiResponse({ status: 200, description: 'Incomes retrieved successfully' })
  @Get()
  async getIncomes(@CurrentUser() user: CurrentUserType) {
    return this.incomesService.getIncomes(user.id);
  }

  @ApiOperation({ summary: 'Get total income for user' })
  @ApiResponse({ status: 200, description: 'Total income calculated successfully' })
  @Get('total')
  async getTotalIncome(@CurrentUser() user: CurrentUserType) {
    return this.incomesService.getTotalIncome(user.id);
  }

  @ApiOperation({ summary: 'Get recurrent incomes' })
  @ApiResponse({ status: 200, description: 'Recurrent incomes retrieved successfully' })
  @Get('recurrent')
  async getRecurrentIncomes(@CurrentUser() user: CurrentUserType) {
    return this.incomesService.getRecurrentIncomes(user.id);
  }

  @ApiOperation({ summary: 'Create new income' })
  @ApiResponse({ status: 201, description: 'Income created successfully' })
  @Post()
  async createIncome(
    @CurrentUser() user: CurrentUserType,
    @Body() createIncomeDto: CreateIncomeDto,
  ) {
    return this.incomesService.createIncome(user.id, createIncomeDto);
  }

  @ApiOperation({ summary: 'Get income by ID' })
  @ApiResponse({ status: 200, description: 'Income retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Income not found' })
  @Get(':id')
  async getIncomeById(
    @CurrentUser() user: CurrentUserType,
    @Param('id') id: string,
  ) {
    return this.incomesService.getIncomeById(user.id, id);
  }

  @ApiOperation({ summary: 'Update income' })
  @ApiResponse({ status: 200, description: 'Income updated successfully' })
  @ApiResponse({ status: 404, description: 'Income not found' })
  @Put(':id')
  async updateIncome(
    @CurrentUser() user: CurrentUserType,
    @Param('id') id: string,
    @Body() updateIncomeDto: UpdateIncomeDto,
  ) {
    return this.incomesService.updateIncome(user.id, id, updateIncomeDto);
  }

  @ApiOperation({ summary: 'Delete income' })
  @ApiResponse({ status: 200, description: 'Income deleted successfully' })
  @ApiResponse({ status: 404, description: 'Income not found' })
  @Delete(':id')
  async deleteIncome(
    @CurrentUser() user: CurrentUserType,
    @Param('id') id: string,
  ) {
    return this.incomesService.deleteIncome(user.id, id);
  }
}