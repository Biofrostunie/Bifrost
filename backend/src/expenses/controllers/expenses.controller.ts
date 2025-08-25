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
  Res,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';

import { ExpensesService } from '../services/expenses.service';
import { CreateExpenseDto } from '../dto/create-expense.dto';
import { UpdateExpenseDto } from '../dto/update-expense.dto';
import { GetExpensesQueryDto } from '../dto/get-expenses-query.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserType } from '../../common/decorators/current-user.decorator';

@ApiTags('Expenses')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller({ path: 'expenses', version: '1' })
export class ExpensesController {
  private readonly logger = new Logger(ExpensesController.name);

  constructor(private readonly expensesService: ExpensesService) {}

  @ApiOperation({ summary: 'Get user expenses' })
  @ApiResponse({ status: 200, description: 'Expenses retrieved successfully' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date filter (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date filter (YYYY-MM-DD)' })
  @ApiQuery({ name: 'category', required: false, description: 'Category filter' })
  @ApiQuery({ name: 'essential', required: false, description: 'Filter by essential expenses' })
  @Get()
  async getExpenses(
    @CurrentUser() user: CurrentUserType,
    @Query() query: GetExpensesQueryDto,
  ) {
    this.logger.log(`Getting expenses for user: ${user.email} with query:`, query);
    return this.expensesService.getExpenses(user.id, query);
  }

  @ApiOperation({ 
    summary: 'Generate expense report PDF',
    description: 'Generates a comprehensive PDF report of user expenses for the specified period',
  })
  @ApiResponse({ 
    status: 200, 
    description: 'PDF report generated successfully',
    headers: {
      'Content-Type': {
        description: 'application/pdf',
      },
      'Content-Disposition': {
        description: 'attachment; filename="expense-report.pdf"',
      },
    },
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - invalid parameters',
  })
  @ApiResponse({ 
    status: 404, 
    description: 'User not found',
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Internal server error - PDF generation failed',
  })
  @ApiResponse({ 
    status: 503, 
    description: 'Service unavailable - PDF service temporarily down',
  })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date filter (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date filter (YYYY-MM-DD)' })
  @ApiQuery({ name: 'category', required: false, description: 'Category filter' })
  @ApiQuery({ name: 'essential', required: false, description: 'Filter by essential expenses' })
  @Get('report/pdf')
  async generateExpenseReportPdf(
    @CurrentUser() user: CurrentUserType,
    @Query() query: GetExpensesQueryDto,
    @Res() res: Response,
  ) {
    const requestId = Math.random().toString(36).substring(7);
    
    this.logger.log(`[${requestId}] PDF generation request started`, {
      userId: user.id,
      userEmail: user.email,
      userFullName: user.fullName,
      query,
      timestamp: new Date().toISOString(),
    });

    try {
      // Validate query parameters
      if (query.startDate && query.endDate) {
        const startDate = new Date(query.startDate);
        const endDate = new Date(query.endDate);
        
        if (startDate > endDate) {
          this.logger.warn(`[${requestId}] Invalid date range: ${query.startDate} > ${query.endDate}`);
          throw new HttpException(
            'Start date cannot be after end date',
            HttpStatus.BAD_REQUEST,
          );
        }
      }

      // Log the exact query being processed
      this.logger.log(`[${requestId}] Processing query:`, {
        startDate: query.startDate,
        endDate: query.endDate,
        category: query.category,
        essential: query.essential,
      });

      // Set initial response headers to indicate processing
      res.set({
        'X-Request-ID': requestId,
        'X-Processing': 'true',
      });

      // Generate PDF with timeout handling
      const startTime = Date.now();
      const pdfBuffer = await Promise.race([
        this.expensesService.generateExpenseReportPdf(user.id, query),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('PDF generation timeout after 60 seconds')), 60000)
        ),
      ]);
      
      const processingTime = Date.now() - startTime;
      
      if (!pdfBuffer || pdfBuffer.length === 0) {
        this.logger.error(`[${requestId}] PDF generation failed - empty buffer`);
        throw new HttpException(
          'Failed to generate PDF - empty result',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      
      const filename = `expense-report-${user.email.split('@')[0]}-${new Date().toISOString().split('T')[0]}.pdf`;
      
      this.logger.log(`[${requestId}] PDF generation completed successfully`, {
        bufferSize: pdfBuffer.length,
        filename,
        processingTimeMs: processingTime,
      });
      
      // Set proper headers for PDF response
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-Request-ID': requestId,
        'X-Processing-Time': processingTime.toString(),
        'X-Processing': 'false',
      });
      
      // Send the PDF buffer
      res.send(pdfBuffer);
      
    } catch (error) {
      this.logger.error(`[${requestId}] PDF generation failed`, {
        userId: user.id,
        userEmail: user.email,
        query,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString(),
      });
      
      // Determine appropriate status code and message
      let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      let errorMessage = 'Failed to generate PDF report';
      let userMessage = 'An unexpected error occurred while generating your report. Please try again.';
      
      if (error instanceof HttpException) {
        statusCode = error.getStatus();
        errorMessage = error.message;
        userMessage = error.message;
      } else if (error instanceof Error) {
        if (error.message.includes('not found')) {
          statusCode = HttpStatus.NOT_FOUND;
          userMessage = 'User or data not found. Please check your account and try again.';
        } else if (error.message.includes('timeout')) {
          statusCode = HttpStatus.REQUEST_TIMEOUT;
          userMessage = 'PDF generation timed out. Please try again with a smaller date range or fewer filters.';
        } else if (error.message.includes('communication') || error.message.includes('Browser')) {
          statusCode = HttpStatus.SERVICE_UNAVAILABLE;
          userMessage = 'PDF service is temporarily unavailable. Please try again in a few minutes.';
        } else if (error.message.includes('Invalid') || error.message.includes('validation')) {
          statusCode = HttpStatus.BAD_REQUEST;
          userMessage = 'Invalid request parameters. Please check your filters and try again.';
        }
        errorMessage = error.message;
      }
      
      // Return JSON error response
      if (!res.headersSent) {
        res.status(statusCode).json({
          success: false,
          message: userMessage,
          error: errorMessage,
          timestamp: new Date().toISOString(),
          requestId,
          retryable: statusCode >= 500 || statusCode === HttpStatus.REQUEST_TIMEOUT,
        });
      }
    }
  }

  @ApiOperation({ summary: 'Create new expense' })
  @ApiResponse({ status: 201, description: 'Expense created successfully' })
  @Post()
  async createExpense(
    @CurrentUser() user: CurrentUserType,
    @Body() createExpenseDto: CreateExpenseDto,
  ) {
    return this.expensesService.createExpense(user.id, createExpenseDto);
  }

  @ApiOperation({ summary: 'Get expense by ID' })
  @ApiResponse({ status: 200, description: 'Expense retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Expense not found' })
  @Get(':id')
  async getExpenseById(
    @CurrentUser() user: CurrentUserType,
    @Param('id') id: string,
  ) {
    return this.expensesService.getExpenseById(user.id, id);
  }

  @ApiOperation({ summary: 'Update expense' })
  @ApiResponse({ status: 200, description: 'Expense updated successfully' })
  @ApiResponse({ status: 404, description: 'Expense not found' })
  @Put(':id')
  async updateExpense(
    @CurrentUser() user: CurrentUserType,
    @Param('id') id: string,
    @Body() updateExpenseDto: UpdateExpenseDto,
  ) {
    return this.expensesService.updateExpense(user.id, id, updateExpenseDto);
  }

  @ApiOperation({ summary: 'Delete expense' })
  @ApiResponse({ status: 200, description: 'Expense deleted successfully' })
  @ApiResponse({ status: 404, description: 'Expense not found' })
  @Delete(':id')
  async deleteExpense(
    @CurrentUser() user: CurrentUserType,
    @Param('id') id: string,
  ) {
    return this.expensesService.deleteExpense(user.id, id);
  }
}