import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { BankAccountsService } from '../services/bank-accounts.service';
import { CreateBankAccountDto } from '../dto/create-bank-account.dto';
import { UpdateBankAccountDto } from '../dto/update-bank-account.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserType } from '../../common/decorators/current-user.decorator';

@ApiTags('Bank Accounts')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller({ path: 'bank-accounts', version: '1' })
export class BankAccountsController {
  constructor(private readonly service: BankAccountsService) {}

  @ApiOperation({ summary: 'List user bank accounts' })
  @ApiResponse({ status: 200, description: 'Bank accounts retrieved' })
  @Get()
  async getAll(@CurrentUser() user: CurrentUserType) {
    return this.service.findByUserId(user.id);
  }

  @ApiOperation({ summary: 'Create bank account' })
  @ApiResponse({ status: 201, description: 'Bank account created' })
  @Post()
  async create(@CurrentUser() user: CurrentUserType, @Body() dto: CreateBankAccountDto) {
    return this.service.create(user.id, dto);
  }

  @ApiOperation({ summary: 'Get bank account by id' })
  @ApiResponse({ status: 200, description: 'Bank account found' })
  @Get(':id')
  async getById(@CurrentUser() user: CurrentUserType, @Param('id') id: string) {
    return this.service.findById(user.id, id);
  }

  @ApiOperation({ summary: 'Update bank account' })
  @ApiResponse({ status: 200, description: 'Bank account updated' })
  @Put(':id')
  async update(
    @CurrentUser() user: CurrentUserType,
    @Param('id') id: string,
    @Body() dto: UpdateBankAccountDto,
  ) {
    return this.service.update(user.id, id, dto);
  }

  @ApiOperation({ summary: 'Delete bank account' })
  @ApiResponse({ status: 200, description: 'Bank account deleted' })
  @Delete(':id')
  async remove(@CurrentUser() user: CurrentUserType, @Param('id') id: string) {
    return this.service.delete(user.id, id);
  }
}