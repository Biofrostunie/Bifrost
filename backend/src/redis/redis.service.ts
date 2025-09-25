import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis, { RedisOptions } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);

  private client!: Redis;
  private subscriber!: Redis;
  private publisher!: Redis;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    await this.createConnections();
  }

  async onModuleDestroy() {
    await this.closeConnections();
  }

  private async createConnections() {
    const redisConfig: RedisOptions = {
      host: this.configService.get<string>('REDIS_HOST', 'localhost'),
      port: this.configService.get<number>('REDIS_PORT', 6379),
      password: this.configService.get<string>('REDIS_PASSWORD'),
      db: this.configService.get<number>('REDIS_DB', 0),
      maxRetriesPerRequest: 3,
      keepAlive: 30000,
      connectTimeout: 10000,
      commandTimeout: 5000,
      family: 4,
      keyPrefix: this.configService.get<string>('REDIS_KEY_PREFIX', 'bifrost:'),
      enableReadyCheck: true,
      autoResubscribe: true,
      autoResendUnfulfilledCommands: true,
      enableOfflineQueue: true,
      retryStrategy: (times) => Math.min(times * 50, 2000),
      reconnectOnError: (err) => err.message.includes('READONLY'),
    };

    try {
      if (!this.client) {
        this.client = new Redis(redisConfig);
        if (this.client.status === 'wait') {
          await this.client.connect();
        }
      }

      if (!this.subscriber) {
        this.subscriber = new Redis({ ...redisConfig, keyPrefix: '' });
        if (this.subscriber.status === 'wait') {
          await this.subscriber.connect();
        }
      }

      if (!this.publisher) {
        this.publisher = new Redis({ ...redisConfig, keyPrefix: '' });
        if (this.publisher.status === 'wait') {
          await this.publisher.connect();
        }
      }

      this.setupEventHandlers();

      await Promise.all([
        this.client.ping(),
        this.subscriber.ping(),
        this.publisher.ping(),
      ]);

      this.logger.log('✅ Redis connections established successfully');
    } catch (error) {
      this.logger.error('❌ Failed to connect to Redis:', error);
      throw error;
    }
  }

  private setupEventHandlers() {
    this.client.on('connect', () => {
      this.logger.log('🔗 Redis client connected');
    });

    this.client.on('error', (error) => {
      this.logger.error('❌ Redis client error:', error);
    });

    this.client.on('close', () => {
      this.logger.warn('⚠️ Redis client connection closed');
    });

    this.client.on('reconnecting', () => {
      this.logger.log('🔄 Redis client reconnecting...');
    });

    this.client.on('ready', () => {
      this.logger.log('✅ Redis client ready');
    });

    this.client.on('end', () => {
      this.logger.warn('⚠️ Redis client connection ended');
    });

    this.subscriber.on('connect', () => {
      this.logger.log('🔗 Redis subscriber connected');
    });

    this.subscriber.on('error', (error) => {
      this.logger.error('❌ Redis subscriber error:', error);
    });

    this.subscriber.on('ready', () => {
      this.logger.log('✅ Redis subscriber ready');
    });

    this.publisher.on('connect', () => {
      this.logger.log('🔗 Redis publisher connected');
    });

    this.publisher.on('error', (error) => {
      this.logger.error('❌ Redis publisher error:', error);
    });

    this.publisher.on('ready', () => {
      this.logger.log('✅ Redis publisher ready');
    });
  }

  private async closeConnections() {
    try {
      const closePromises = [];

      if (this.client) closePromises.push(this.client.quit());
      if (this.subscriber) closePromises.push(this.subscriber.quit());
      if (this.publisher) closePromises.push(this.publisher.quit());

      await Promise.all(closePromises);
      this.logger.log('✅ Redis connections closed gracefully');
    } catch (error) {
      this.logger.error('❌ Error closing Redis connections:', error);
    }
  }

  getClient(): Redis {
    if (!this.client) {
      throw new Error('Redis client not initialized. Make sure onModuleInit has been called.');
    }
    return this.client;
  }

  getSubscriber(): Redis {
    if (!this.subscriber) {
      throw new Error('Redis subscriber not initialized. Make sure onModuleInit has been called.');
    }
    return this.subscriber;
  }

  getPublisher(): Redis {
    if (!this.publisher) {
      throw new Error('Redis publisher not initialized. Make sure onModuleInit has been called.');
    }
    return this.publisher;
  }

  async isHealthy(): Promise<boolean> {
    try {
      if (!this.client || this.client.status !== 'ready') return false;
      const result = await this.client.ping();
      return result === 'PONG';
    } catch (error) {
      this.logger.error('Redis health check failed:', error);
      return false;
    }
  }

  isConnected(): boolean {
    return this.client?.status === 'ready';
  }

  areConnectionsReady(): boolean {
    return !!(
      this.client &&
      this.subscriber &&
      this.publisher &&
      this.client.status === 'ready' &&
      this.subscriber.status === 'ready' &&
      this.publisher.status === 'ready'
    );
  }

  getConnectionStatus() {
    return {
      client: {
        status: this.client?.status || 'not_initialized',
        connected: this.client?.status === 'ready',
      },
      subscriber: {
        status: this.subscriber?.status || 'not_initialized',
        connected: this.subscriber?.status === 'ready',
      },
      publisher: {
        status: this.publisher?.status || 'not_initialized',
        connected: this.publisher?.status === 'ready',
      },
      overall: {
        isHealthy: this.isConnected(),
        allReady: this.areConnectionsReady(),
      },
    };
  }

  getConfigInfo() {
    return {
      host: this.configService.get<string>('REDIS_HOST', 'localhost'),
      port: this.configService.get<number>('REDIS_PORT', 6379),
      db: this.configService.get<number>('REDIS_DB', 0),
      keyPrefix: this.configService.get<string>('REDIS_KEY_PREFIX', 'bifrost:'),
      hasPassword: !!this.configService.get<string>('REDIS_PASSWORD'),
    };
  }

  async forceReconnect(): Promise<void> {
    try {
      this.logger.log('🔄 Forcing Redis reconnection...');

      await Promise.all([
        this.client?.disconnect(),
        this.subscriber?.disconnect(),
        this.publisher?.disconnect(),
      ]);

      await this.createConnections();

      this.logger.log('✅ Redis reconnection completed');
    } catch (error) {
      this.logger.error('❌ Error during forced reconnection:', error);
      throw error;
    }
  }
}
