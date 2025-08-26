import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { RateLimitService, RateLimitOptions } from '../rate-limit.service';

export const RATE_LIMIT_KEY = 'rate_limit';

export interface RateLimitDecoratorOptions extends RateLimitOptions {
  identifierGenerator?: (request: Request) => string;
  message?: string;
}

export const RateLimit = (options: RateLimitDecoratorOptions) =>
  Reflect.metadata(RATE_LIMIT_KEY, options);

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly logger = new Logger(RateLimitGuard.name);

  constructor(
    private readonly rateLimitService: RateLimitService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const rateLimitOptions = this.reflector.get<RateLimitDecoratorOptions>(
      RATE_LIMIT_KEY,
      context.getHandler(),
    );

    if (!rateLimitOptions) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse();
    
    const identifier = this.getIdentifier(request, rateLimitOptions);

    try {
      const result = await this.rateLimitService.checkRateLimit(
        identifier,
        rateLimitOptions,
      );

      // Set rate limit headers
      response.setHeader('X-RateLimit-Limit', rateLimitOptions.maxRequests);
      response.setHeader('X-RateLimit-Remaining', result.remaining);
      response.setHeader('X-RateLimit-Reset', result.resetTime.toISOString());

      if (!result.allowed) {
        const message = rateLimitOptions.message || 'Too many requests';
        this.logger.warn(
          `Rate limit exceeded for ${identifier}: ${result.totalHits}/${rateLimitOptions.maxRequests}`
        );
        
        throw new HttpException(
          {
            statusCode: HttpStatus.TOO_MANY_REQUESTS,
            message,
            error: 'Too Many Requests',
            retryAfter: Math.ceil((result.resetTime.getTime() - Date.now()) / 1000),
          },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      return true;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error(`Rate limit guard error for ${identifier}:`, error);
      // On error, allow the request to prevent blocking legitimate users
      return true;
    }
  }

  private getIdentifier(
    request: Request,
    options: RateLimitDecoratorOptions,
  ): string {
    if (options.identifierGenerator) {
      return options.identifierGenerator(request);
    }

    // Default: use IP address
    return request.ip || request.connection.remoteAddress || 'unknown';
  }
}