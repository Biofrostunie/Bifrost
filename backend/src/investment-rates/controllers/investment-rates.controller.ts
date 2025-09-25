import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { InvestmentRatesService } from '../services/investment-rates.service';
import { GetRatesResponseDto } from '../dto/get-rates-query.dto';
import { InvestmentRatesResponse } from '../interfaces/investment-rate.interface';

@ApiTags('investment-rates')
@Controller('investment-rates')
export class InvestmentRatesController {
  constructor(private readonly ratesService: InvestmentRatesService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all investment rates',
    description: 'Retrieves current SELIC, IPCA, Poupança, and CDI rates from Banco Central. Data is cached for 1 hour.',
  })
  @ApiResponse({
    status: 200,
    description: 'Investment rates retrieved successfully',
    type: GetRatesResponseDto
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error or Banco Central service unavailable'
  })
  async getAllRates(): Promise<InvestmentRatesResponse> {
    try {
      return await this.ratesService.getAllRates();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      throw new HttpException(
        `Erro ao buscar taxas: ${errorMessage}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
