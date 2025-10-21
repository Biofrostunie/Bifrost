import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateExpenseDto } from '../dto/create-expense.dto';
import { UpdateExpenseDto } from '../dto/update-expense.dto';
import { GetExpensesQueryDto } from '../dto/get-expenses-query.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class ExpensesRepository {
  private readonly logger = new Logger(ExpensesRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateExpenseDto & { userId: string }) {
    return this.prisma.expense.create({
      data: {
        ...data,
        amount: new Decimal(data.amount),
        date: new Date(data.date),
      },
    });
  }

  async findById(id: string) {
    return this.prisma.expense.findUnique({
      where: { id },
    });
  }

  async findByUserId(userId: string, query: GetExpensesQueryDto) {
    this.logger.log(`Finding expenses for user: ${userId} with query:`, query);
    
    const { startDate, endDate, category, essential } = query;
    
    const where: any = { userId };

    // Build date filter
    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate);
        this.logger.log(`Start date filter: ${startDate} -> ${where.date.gte}`);
      }
      if (endDate) {
        // Add time to end date to include the entire day
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        where.date.lte = endDateTime;
        this.logger.log(`End date filter: ${endDate} -> ${where.date.lte}`);
      }
    }

    // Build category filter
    if (category) {
      where.category = {
        equals: category,
        mode: 'insensitive', // Case insensitive search
      };
      this.logger.log(`Category filter: ${category}`);
    }

    // Build essential filter
    if (essential !== undefined) {
      where.essential = essential;
      this.logger.log(`Essential filter: ${essential}`);
    }

    this.logger.log('Final where clause:', JSON.stringify(where, null, 2));

    try {
      const expenses = await this.prisma.expense.findMany({
        where,
        orderBy: { date: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              fullName: true,
            },
          },
        },
      });

      this.logger.log(`Found ${expenses.length} expenses for user ${userId}`);
      
      // Log first few expenses for debugging
      if (expenses.length > 0) {
        this.logger.log('Sample expenses:', expenses.slice(0, 3).map((e: any) => ({
          id: e.id,
          description: e.description,
          amount: e.amount.toString(),
          category: e.category,
          date: e.date,
          essential: e.essential,
          userId: e.userId,
        })));
      } else {
        // Check if user has any expenses at all
        const totalExpenses = await this.prisma.expense.count({
          where: { userId },
        });
        this.logger.warn(`No expenses found with filters, but user has ${totalExpenses} total expenses`);
        
        // Log some sample expenses without filters for debugging
        if (totalExpenses > 0) {
          const sampleExpenses = await this.prisma.expense.findMany({
            where: { userId },
            take: 3,
            orderBy: { date: 'desc' },
          });
          this.logger.log('Sample user expenses (no filters):', sampleExpenses.map((e: any) => ({
            id: e.id,
            description: e.description,
            amount: e.amount.toString(),
            category: e.category,
            date: e.date,
            essential: e.essential,
          })));
        }
      }

      return expenses;
    } catch (error) {
      this.logger.error('Error finding expenses:', error);
      throw error;
    }
  }

  async update(id: string, data: UpdateExpenseDto) {
    const updateData: any = { ...data };
    
    if (data.amount !== undefined) {
      updateData.amount = new Decimal(data.amount);
    }
    
    if (data.date !== undefined) {
      updateData.date = new Date(data.date);
    }

    return this.prisma.expense.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: string) {
    return this.prisma.expense.delete({
      where: { id },
    });
  }

  async getTotalByCategory(userId: string, startDate?: Date, endDate?: Date) {
    const where: any = { userId };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = startDate;
      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        where.date.lte = endDateTime;
      }
    }

    return this.prisma.expense.groupBy({
      by: ['category'],
      where,
      _sum: {
        amount: true,
      },
    });
  }

  async getMonthlyTotals(userId: string, year: number) {
    return this.prisma.$queryRaw`
      SELECT 
        EXTRACT(MONTH FROM date) as month,
        SUM(amount) as total,
        COUNT(*) as count
      FROM expenses 
      WHERE "userId" = ${userId}::uuid 
        AND EXTRACT(YEAR FROM date) = ${year}
      GROUP BY EXTRACT(MONTH FROM date)
      ORDER BY month
    `;
  }

  // Debug method to check user's expenses
  async debugUserExpenses(userId: string) {
    this.logger.log(`=== DEBUG: Checking expenses for user ${userId} ===`);
    
    try {
      // Check if user exists
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, fullName: true },
      });
      
      if (!user) {
        this.logger.error(`User ${userId} not found`);
        return;
      }
      
      this.logger.log(`User found: ${user.email} (${user.fullName})`);
      
      // Get total count
      const totalCount = await this.prisma.expense.count({
        where: { userId },
      });
      
      this.logger.log(`Total expenses for user: ${totalCount}`);
      
      if (totalCount > 0) {
        // Get recent expenses
        const recentExpenses = await this.prisma.expense.findMany({
          where: { userId },
          take: 5,
          orderBy: { date: 'desc' },
        });
        
        this.logger.log('Recent expenses:', recentExpenses.map((e: any) => ({
          id: e.id,
          description: e.description,
          amount: e.amount.toString(),
          category: e.category,
          date: e.date.toISOString(),
          essential: e.essential,
        })));
        
        // Get date range
        const dateRange = await this.prisma.expense.aggregate({
          where: { userId },
          _min: { date: true },
          _max: { date: true },
        });
        
        this.logger.log('Date range:', {
          earliest: dateRange._min.date?.toISOString(),
          latest: dateRange._max.date?.toISOString(),
        });
        
        // Get categories
        const categories = await this.prisma.expense.groupBy({
          by: ['category'],
          where: { userId },
          _count: { category: true },
        });
        
        this.logger.log('Categories:', categories);
      }
      
    } catch (error) {
      this.logger.error('Error in debug method:', error);
    }
    
    this.logger.log(`=== END DEBUG ===`);
  }
}