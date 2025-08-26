import { SetMetadata } from '@nestjs/common';

export const CACHE_KEY = 'cache';

export interface CacheDecoratorOptions {
  ttl?: number;
  prefix?: string;
  keyGenerator?: (...args: any[]) => string;
}

export const Cache = (options: CacheDecoratorOptions = {}) =>
  SetMetadata(CACHE_KEY, options);