import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from './redis.service';

export interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyGenerator?: (identifier: string) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: Date;
  totalHits: number;
}

@Injectable()
export class RateLimitService {
  private readonly logger = new Logger(RateLimitService.name);
  private readonly rateLimitPrefix = 'rate_limit';

  constructor(private readonly redisService: RedisService) {}

  /**
   * Check rate limit for a given identifier
   */
  async checkRateLimit(
    identifier: string,
    options: RateLimitOptions,
  ): Promise<RateLimitResult> {
    try {
      const client = this.redisService.getClient();
      const key = this.buildKey(identifier, options.keyGenerator);
      const windowSeconds = Math.ceil(options.windowMs / 1000);

      // Use sliding window log approach
      const now = Date.now();
      const windowStart = now - options.windowMs;

      const pipeline = client.pipeline();
      
      // Remove expired entries
      pipeline.zremrangebyscore(key, 0, windowStart);
      
      // Count current requests in window
      pipeline.zcard(key);
      
      // Add current request
      pipeline.zadd(key, now, `${now}-${Math.random()}`);
      
      // Set expiration
      pipeline.expire(key, windowSeconds);

      const results = await pipeline.exec();
      
      if (!results) {
        throw new Error('Pipeline execution failed');
      }

      const currentCount = (results[1][1] as number) || 0;
      const totalHits = currentCount + 1;
      const remaining = Math.max(0, options.maxRequests - totalHits);
      const allowed = totalHits <= options.maxRequests;
      const resetTime = new Date(now + options.windowMs);

      this.logger.debug(
        `Rate limit check for ${identifier}: ${totalHits}/${options.maxRequests} (allowed: ${allowed})`
      );

      return {
        allowed,
        remaining,
        resetTime,
        totalHits,
      };
    } catch (error) {
      this.logger.error(`Rate limit check error for ${identifier}:`, error);
      // On error, allow the request to prevent blocking legitimate users
      return {
        allowed: true,
        remaining: options.maxRequests - 1,
        resetTime: new Date(Date.now() + options.windowMs),
        totalHits: 1,
      };
    }
  }

  /**
   * Reset rate limit for an identifier
   */
  async resetRateLimit(
    identifier: string,
    keyGenerator?: (identifier: string) => string,
  ): Promise<void> {
    try {
      const client = this.redisService.getClient();
      const key = this.buildKey(identifier, keyGenerator);
      await client.del(key);
      
      this.logger.debug(`Rate limit reset for ${identifier}`);
    } catch (error) {
      this.logger.error(`Rate limit reset error for ${identifier}:`, error);
    }
  }

  /**
   * Get current rate limit status
   */
  async getRateLimitStatus(
    identifier: string,
    options: RateLimitOptions,
  ): Promise<RateLimitResult> {
    try {
      const client = this.redisService.getClient();
      const key = this.buildKey(identifier, options.keyGenerator);
      const now = Date.now();
      const windowStart = now - options.windowMs;

      // Clean expired entries and count current
      const pipeline = client.pipeline();
      pipeline.zremrangebyscore(key, 0, windowStart);
      pipeline.zcard(key);

      const results = await pipeline.exec();
      const currentCount = (results?.[1]?.[1] as number) || 0;
      const remaining = Math.max(0, options.maxRequests - currentCount);
      const resetTime = new Date(now + options.windowMs);

      return {
        allowed: currentCount < options.maxRequests,
        remaining,
        resetTime,
        totalHits: currentCount,
      };
    } catch (error) {
      this.logger.error(`Rate limit status error for ${identifier}:`, error);
      return {
        allowed: true,
        remaining: options.maxRequests,
        resetTime: new Date(Date.now() + options.windowMs),
        totalHits: 0,
      };
    }
  }

  /**
   * Increment rate limit counter (for successful requests)
   */
  async incrementRateLimit(
    identifier: string,
    options: RateLimitOptions,
  ): Promise<RateLimitResult> {
    return this.checkRateLimit(identifier, options);
  }

  /**
   * Check if identifier is currently rate limited
   */
  async isRateLimited(
    identifier: string,
    options: RateLimitOptions,
  ): Promise<boolean> {
    const status = await this.getRateLimitStatus(identifier, options);
    return !status.allowed;
  }

  /**
   * Get time until rate limit resets
   */
  async getTimeUntilReset(
    identifier: string,
    options: RateLimitOptions,
  ): Promise<number> {
    const status = await this.getRateLimitStatus(identifier, options);
    return Math.max(0, status.resetTime.getTime() - Date.now());
  }

  /**
   * Bulk rate limit check for multiple identifiers
   */
  async bulkCheckRateLimit(
    identifiers: string[],
    options: RateLimitOptions,
  ): Promise<Map<string, RateLimitResult>> {
    const results = new Map<string, RateLimitResult>();

    try {
      const promises = identifiers.map(identifier =>
        this.checkRateLimit(identifier, options)
      );

      const rateLimitResults = await Promise.all(promises);

      identifiers.forEach((identifier, index) => {
        results.set(identifier, rateLimitResults[index]);
      });
    } catch (error) {
      this.logger.error('Bulk rate limit check error:', error);
      
      // Return default allowed results on error
      identifiers.forEach(identifier => {
        results.set(identifier, {
          allowed: true,
          remaining: options.maxRequests - 1,
          resetTime: new Date(Date.now() + options.windowMs),
          totalHits: 1,
        });
      });
    }

    return results;
  }

  private buildKey(
    identifier: string,
    keyGenerator?: (identifier: string) => string,
  ): string {
    const baseKey = keyGenerator ? keyGenerator(identifier) : identifier;
    return `${this.rateLimitPrefix}:${baseKey}`;
  }
}