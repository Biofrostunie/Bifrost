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

import { InvestmentSimulationsService } from '../services/investment-simulations.service';
import { CreateSimulationDto } from '../dto/create-simulation.dto';
import { UpdateSimulationDto } from '../dto/update-simulation.dto';
import { CalculateInvestmentDto } from '../dto/calculate-investment.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserType } from '../../common/decorators/current-user.decorator';

@ApiTags('Investment Simulations')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('investment-simulations')
export class InvestmentSimulationsController {
  constructor(
    private readonly investmentSimulationsService: InvestmentSimulationsService,
  ) {}

  @ApiOperation({ summary: 'Get user investment simulations' })
  @ApiResponse({ status: 200, description: 'Simulations retrieved successfully' })
  @Get()
  async getSimulations(@CurrentUser() user: CurrentUserType) {
    return this.investmentSimulationsService.getSimulations(user.id);
  }

  @ApiOperation({ summary: 'Calculate investment projection' })
  @ApiResponse({ status: 200, description: 'Investment projection calculated successfully' })
  @Post('calculate')
  async calculateInvestment(@Body() calculateDto: CalculateInvestmentDto) {
    return this.investmentSimulationsService.calculateInvestment(calculateDto);
  }

  @ApiOperation({ summary: 'Create new investment simulation' })
  @ApiResponse({ status: 201, description: 'Simulation created successfully' })
  @Post()
  async createSimulation(
    @CurrentUser() user: CurrentUserType,
    @Body() createSimulationDto: CreateSimulationDto,
  ) {
    return this.investmentSimulationsService.createSimulation(
      user.id,
      createSimulationDto,
    );
  }

  @ApiOperation({ summary: 'Get simulation by ID' })
  @ApiResponse({ status: 200, description: 'Simulation retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Simulation not found' })
  @Get(':id')
  async getSimulationById(
    @CurrentUser() user: CurrentUserType,
    @Param('id') id: string,
  ) {
    return this.investmentSimulationsService.getSimulationById(user.id, id);
  }

  @ApiOperation({ summary: 'Get simulation with calculation' })
  @ApiResponse({ status: 200, description: 'Simulation with calculation retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Simulation not found' })
  @Get(':id/calculate')
  async getSimulationWithCalculation(
    @CurrentUser() user: CurrentUserType,
    @Param('id') id: string,
  ) {
    return this.investmentSimulationsService.getSimulationWithCalculation(user.id, id);
  }

  @ApiOperation({ summary: 'Update simulation' })
  @ApiResponse({ status: 200, description: 'Simulation updated successfully' })
  @ApiResponse({ status: 404, description: 'Simulation not found' })
  @Put(':id')
  async updateSimulation(
    @CurrentUser() user: CurrentUserType,
    @Param('id') id: string,
    @Body() updateSimulationDto: UpdateSimulationDto,
  ) {
    return this.investmentSimulationsService.updateSimulation(
      user.id,
      id,
      updateSimulationDto,
    );
  }

  @ApiOperation({ summary: 'Delete simulation' })
  @ApiResponse({ status: 200, description: 'Simulation deleted successfully' })
  @ApiResponse({ status: 404, description: 'Simulation not found' })
  @Delete(':id')
  async deleteSimulation(
    @CurrentUser() user: CurrentUserType,
    @Param('id') id: string,
  ) {
    return this.investmentSimulationsService.deleteSimulation(user.id, id);
  }
}