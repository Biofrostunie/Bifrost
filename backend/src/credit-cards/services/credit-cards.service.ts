import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreditCardsRepository } from '../repositories/credit-cards.repository';
import { CreateCreditCardDto } from '../dto/create-credit-card.dto';
import { UpdateCreditCardDto } from '../dto/update-credit-card.dto';

@Injectable()
export class CreditCardsService {
  constructor(private readonly repository: CreditCardsRepository) {}

  async create(userId: string, dto: CreateCreditCardDto) {
    return this.repository.create(userId, dto);
  }

  async findByUserId(userId: string) {
    return this.repository.findByUserId(userId);
  }

  async findById(userId: string, id: string) {
    const card = await this.repository.findById(id);
    if (!card) throw new NotFoundException('Credit card not found');
    if (card.userId !== userId) throw new ForbiddenException('Access denied');
    return card;
  }

  async update(userId: string, id: string, dto: UpdateCreditCardDto) {
    await this.findById(userId, id);
    return this.repository.update(id, dto);
  }

  async delete(userId: string, id: string) {
    await this.findById(userId, id);
    return this.repository.delete(id);
  }
}