import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiResponse } from '../interfaces/api-response.interface';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    const exceptionResponse = exception.getResponse();
    const message = typeof exceptionResponse === 'string' 
      ? exceptionResponse 
      : (exceptionResponse as any).message || 'Internal server error';

    // Log the exception for debugging
    this.logger.error(`HTTP Exception: ${status}`, {
      path: request.url,
      method: request.method,
      message: Array.isArray(message) ? message.join(', ') : message,
      stack: exception.stack,
    });

    // Check if response is for PDF generation (based on Accept header or path)
    const isPdfRequest = request.path.includes('/pdf') || 
                        request.headers.accept?.includes('application/pdf');

    if (isPdfRequest && !response.headersSent) {
      // For PDF requests, return JSON error instead of trying to send PDF
      response.status(status).json({
        success: false,
        message: Array.isArray(message) ? message[0] : message,
        error: 'PDF generation failed',
        timestamp: new Date().toISOString(),
        path: request.url,
      });
      return;
    }

    // Standard JSON error response
    const apiResponse: ApiResponse = {
      success: false,
      message: Array.isArray(message) ? message[0] : message,
      errors: Array.isArray(message) ? message : [message],
    };

    // Add additional context for development
    if (process.env.NODE_ENV === 'development') {
      (apiResponse as any).timestamp = new Date().toISOString();
      (apiResponse as any).path = request.url;
      (apiResponse as any).method = request.method;
    }

    if (!response.headersSent) {
      response.status(status).json(apiResponse);
    }
  }
}