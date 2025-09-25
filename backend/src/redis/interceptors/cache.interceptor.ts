import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CacheService } from '../cache.service';
import { CACHE_KEY, CacheDecoratorOptions } from '../decorators/cache.decorator';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  private readonly logger = new Logger(CacheInterceptor.name);

  constructor(
    private readonly cacheService: CacheService,
    private readonly reflector: Reflector,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const cacheOptions = this.reflector.get<CacheDecoratorOptions>(
      CACHE_KEY,
      context.getHandler(),
    );

    if (!cacheOptions) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const cacheKey = this.generateCacheKey(context, cacheOptions, request);

    try {
      // Try to get from cache
      const cachedResult = await this.cacheService.get(cacheKey, cacheOptions.prefix);
      
      if (cachedResult !== null) {
        this.logger.debug(`Cache hit for key: ${cacheKey}`);
        return of(cachedResult);
      }

      // If not in cache, execute handler and cache result
      return next.handle().pipe(
        tap(async (result) => {
          try {
            await this.cacheService.set(cacheKey, result, {
              ttl: cacheOptions.ttl,
              prefix: cacheOptions.prefix,
            });
            this.logger.debug(`Cached result for key: ${cacheKey}`);
          } catch (error) {
            this.logger.error(`Failed to cache result for key ${cacheKey}:`, error);
          }
        }),
      );
    } catch (error) {
      this.logger.error(`Cache interceptor error for key ${cacheKey}:`, error);
      return next.handle();
    }
  }

  private generateCacheKey(
    context: ExecutionContext,
    options: CacheDecoratorOptions,
    request: any,
  ): string {
    if (options.keyGenerator) {
      return options.keyGenerator(request.params, request.query, request.body);
    }

    const className = context.getClass().name;
    const methodName = context.getHandler().name;
    const params = JSON.stringify(request.params || {});
    const query = JSON.stringify(request.query || {});

    return `${className}:${methodName}:${params}:${query}`;
  }
}