import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { BankAccountsRepository } from '../repositories/bank-accounts.repository';
import { CreateBankAccountDto } from '../dto/create-bank-account.dto';
import { UpdateBankAccountDto } from '../dto/update-bank-account.dto';

@Injectable()
export class BankAccountsService {
  constructor(private readonly repository: BankAccountsRepository) {}

  async create(userId: string, dto: CreateBankAccountDto) {
    return this.repository.create(userId, dto);
  }

  async findByUserId(userId: string) {
    return this.repository.findByUserId(userId);
  }

  async findById(userId: string, id: string) {
    const account = await this.repository.findById(id);
    if (!account) throw new NotFoundException('Bank account not found');
    if (account.userId !== userId) throw new ForbiddenException('Access denied');
    return account;
  }

  async update(userId: string, id: string, dto: UpdateBankAccountDto) {
    await this.findById(userId, id);
    return this.repository.update(id, dto);
  }

  async delete(userId: string, id: string) {
    await this.findById(userId, id);
    return this.repository.delete(id);
  }
}