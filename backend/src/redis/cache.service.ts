import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from './redis.service';

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  prefix?: string;
  compress?: boolean;
}

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private readonly defaultTTL = 3600; // 1 hour

  constructor(private readonly redisService: RedisService) {}

  /**
   * Set a value in cache
   */
  async set<T>(
    key: string,
    value: T,
    options: CacheOptions = {},
  ): Promise<void> {
    try {
      const client = this.redisService.getClient();
      const finalKey = this.buildKey(key, options.prefix);
      const serializedValue = JSON.stringify(value);
      const ttl = options.ttl || this.defaultTTL;

      await client.setex(finalKey, ttl, serializedValue);
      
      this.logger.debug(`Cache SET: ${finalKey} (TTL: ${ttl}s)`);
    } catch (error) {
      this.logger.error(`Cache SET error for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Get a value from cache
   */
  async get<T>(key: string, prefix?: string): Promise<T | null> {
    try {
      const client = this.redisService.getClient();
      const finalKey = this.buildKey(key, prefix);
      const value = await client.get(finalKey);

      if (!value) {
        this.logger.debug(`Cache MISS: ${finalKey}`);
        return null;
      }

      this.logger.debug(`Cache HIT: ${finalKey}`);
      return JSON.parse(value) as T;
    } catch (error) {
      this.logger.error(`Cache GET error for key ${key}:`, error);
      return null; // Return null on error to allow fallback
    }
  }

  /**
   * Delete a value from cache
   */
  async del(key: string, prefix?: string): Promise<void> {
    try {
      const client = this.redisService.getClient();
      const finalKey = this.buildKey(key, prefix);
      await client.del(finalKey);
      
      this.logger.debug(`Cache DEL: ${finalKey}`);
    } catch (error) {
      this.logger.error(`Cache DEL error for key ${key}:`, error);
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string, prefix?: string): Promise<boolean> {
    try {
      const client = this.redisService.getClient();
      const finalKey = this.buildKey(key, prefix);
      const result = await client.exists(finalKey);
      return result === 1;
    } catch (error) {
      this.logger.error(`Cache EXISTS error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Get TTL of a key
   */
  async ttl(key: string, prefix?: string): Promise<number> {
    try {
      const client = this.redisService.getClient();
      const finalKey = this.buildKey(key, prefix);
      return await client.ttl(finalKey);
    } catch (error) {
      this.logger.error(`Cache TTL error for key ${key}:`, error);
      return -1;
    }
  }

  /**
   * Increment a numeric value
   */
  async incr(key: string, prefix?: string): Promise<number> {
    try {
      const client = this.redisService.getClient();
      const finalKey = this.buildKey(key, prefix);
      return await client.incr(finalKey);
    } catch (error) {
      this.logger.error(`Cache INCR error for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Increment with expiration
   */
  async incrWithExpire(
    key: string,
    ttl: number,
    prefix?: string,
  ): Promise<number> {
    try {
      const client = this.redisService.getClient();
      const finalKey = this.buildKey(key, prefix);
      
      const pipeline = client.pipeline();
      pipeline.incr(finalKey);
      pipeline.expire(finalKey, ttl);
      
      const results = await pipeline.exec();
      return results?.[0]?.[1] as number || 0;
    } catch (error) {
      this.logger.error(`Cache INCR_EXPIRE error for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Get multiple keys
   */
  async mget<T>(keys: string[], prefix?: string): Promise<(T | null)[]> {
    try {
      const client = this.redisService.getClient();
      const finalKeys = keys.map(key => this.buildKey(key, prefix));
      const values = await client.mget(...finalKeys);

      return values.map(value => {
        if (!value) return null;
        try {
          return JSON.parse(value) as T;
        } catch {
          return null;
        }
      });
    } catch (error) {
      this.logger.error(`Cache MGET error:`, error);
      return keys.map(() => null);
    }
  }

  /**
   * Set multiple keys
   */
  async mset<T>(
    keyValuePairs: Array<{ key: string; value: T; ttl?: number }>,
    prefix?: string,
  ): Promise<void> {
    try {
      const client = this.redisService.getClient();
      const pipeline = client.pipeline();

      for (const { key, value, ttl } of keyValuePairs) {
        const finalKey = this.buildKey(key, prefix);
        const serializedValue = JSON.stringify(value);
        const finalTTL = ttl || this.defaultTTL;

        pipeline.setex(finalKey, finalTTL, serializedValue);
      }

      await pipeline.exec();
      this.logger.debug(`Cache MSET: ${keyValuePairs.length} keys`);
    } catch (error) {
      this.logger.error(`Cache MSET error:`, error);
      throw error;
    }
  }

  /**
   * Delete keys by pattern
   */
  async delPattern(pattern: string, prefix?: string): Promise<number> {
    try {
      const client = this.redisService.getClient();
      const finalPattern = this.buildKey(pattern, prefix);
      
      const keys = await client.keys(finalPattern);
      if (keys.length === 0) return 0;

      const result = await client.del(...keys);
      this.logger.debug(`Cache DEL_PATTERN: ${finalPattern} (${result} keys deleted)`);
      
      return result;
    } catch (error) {
      this.logger.error(`Cache DEL_PATTERN error for pattern ${pattern}:`, error);
      return 0;
    }
  }

  /**
   * Cache with automatic refresh
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    options: CacheOptions = {},
  ): Promise<T> {
    try {
      // Try to get from cache first
      const cached = await this.get<T>(key, options.prefix);
      if (cached !== null) {
        return cached;
      }

      // If not in cache, execute factory function
      const value = await factory();
      
      // Store in cache
      await this.set(key, value, options);
      
      return value;
    } catch (error) {
      this.logger.error(`Cache GET_OR_SET error for key ${key}:`, error);
      throw error;
    }
  }

  private buildKey(key: string, prefix?: string): string {
    if (prefix) {
      return `${prefix}:${key}`;
    }
    return key;
  }
}