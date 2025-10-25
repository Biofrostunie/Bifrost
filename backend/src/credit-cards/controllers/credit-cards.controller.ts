import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CreditCardsService } from '../services/credit-cards.service';
import { CreateCreditCardDto } from '../dto/create-credit-card.dto';
import { UpdateCreditCardDto } from '../dto/update-credit-card.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserType } from '../../common/decorators/current-user.decorator';

@ApiTags('Credit Cards')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller({ path: 'credit-cards', version: '1' })
export class CreditCardsController {
  constructor(private readonly service: CreditCardsService) {}

  @ApiOperation({ summary: 'List user credit cards' })
  @ApiResponse({ status: 200, description: 'Credit cards retrieved' })
  @Get()
  async getAll(@CurrentUser() user: CurrentUserType) {
    return this.service.findByUserId(user.id);
  }

  @ApiOperation({ summary: 'Create credit card' })
  @ApiResponse({ status: 201, description: 'Credit card created' })
  @Post()
  async create(@CurrentUser() user: CurrentUserType, @Body() dto: CreateCreditCardDto) {
    return this.service.create(user.id, dto);
  }

  @ApiOperation({ summary: 'Get credit card by id' })
  @ApiResponse({ status: 200, description: 'Credit card found' })
  @Get(':id')
  async getById(@CurrentUser() user: CurrentUserType, @Param('id') id: string) {
    return this.service.findById(user.id, id);
  }

  @ApiOperation({ summary: 'Update credit card' })
  @ApiResponse({ status: 200, description: 'Credit card updated' })
  @Put(':id')
  async update(
    @CurrentUser() user: CurrentUserType,
    @Param('id') id: string,
    @Body() dto: UpdateCreditCardDto,
  ) {
    return this.service.update(user.id, id, dto);
  }

  @ApiOperation({ summary: 'Delete credit card' })
  @ApiResponse({ status: 200, description: 'Credit card deleted' })
  @Delete(':id')
  async remove(@CurrentUser() user: CurrentUserType, @Param('id') id: string) {
    return this.service.delete(user.id, id);
  }
}