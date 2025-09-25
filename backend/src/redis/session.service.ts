import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from './redis.service';

export interface SessionData {
  userId: string;
  email: string;
  fullName?: string;
  isEmailVerified: boolean;
  loginAt: Date;
  lastActivity: Date;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class SessionService {
  private readonly logger = new Logger(SessionService.name);
  private readonly sessionPrefix = 'session';
  private readonly userSessionsPrefix = 'user_sessions';
  private readonly defaultTTL = 7 * 24 * 3600; // 7 days

  constructor(private readonly redisService: RedisService) {}

  /**
   * Create a new session
   */
  async createSession(
    sessionId: string,
    sessionData: SessionData,
    ttl: number = this.defaultTTL,
  ): Promise<void> {
    try {
      const client = this.redisService.getClient();
      const sessionKey = this.getSessionKey(sessionId);
      const userSessionsKey = this.getUserSessionsKey(sessionData.userId);

      const pipeline = client.pipeline();
      
      // Store session data
      pipeline.setex(sessionKey, ttl, JSON.stringify(sessionData));
      
      // Add session to user's session list
      pipeline.sadd(userSessionsKey, sessionId);
      pipeline.expire(userSessionsKey, ttl);

      await pipeline.exec();

      this.logger.debug(`Session created: ${sessionId} for user ${sessionData.userId}`);
    } catch (error) {
      this.logger.error(`Error creating session ${sessionId}:`, error);
      throw error;
    }
  }

  /**
   * Get session data
   */
  async getSession(sessionId: string): Promise<SessionData | null> {
    try {
      const client = this.redisService.getClient();
      const sessionKey = this.getSessionKey(sessionId);
      const data = await client.get(sessionKey);

      if (!data) {
        this.logger.debug(`Session not found: ${sessionId}`);
        return null;
      }

      const sessionData = JSON.parse(data) as SessionData;
      
      // Update last activity
      await this.updateLastActivity(sessionId, sessionData);

      return sessionData;
    } catch (error) {
      this.logger.error(`Error getting session ${sessionId}:`, error);
      return null;
    }
  }

  /**
   * Update session data
   */
  async updateSession(
    sessionId: string,
    updates: Partial<SessionData>,
    ttl?: number,
  ): Promise<void> {
    try {
      const currentSession = await this.getSession(sessionId);
      if (!currentSession) {
        throw new Error(`Session ${sessionId} not found`);
      }

      const updatedSession = {
        ...currentSession,
        ...updates,
        lastActivity: new Date(),
      };

      const client = this.redisService.getClient();
      const sessionKey = this.getSessionKey(sessionId);
      const finalTTL = ttl || this.defaultTTL;

      await client.setex(sessionKey, finalTTL, JSON.stringify(updatedSession));

      this.logger.debug(`Session updated: ${sessionId}`);
    } catch (error) {
      this.logger.error(`Error updating session ${sessionId}:`, error);
      throw error;
    }
  }

  /**
   * Delete a session
   */
  async deleteSession(sessionId: string): Promise<void> {
    try {
      const session = await this.getSession(sessionId);
      if (!session) return;

      const client = this.redisService.getClient();
      const sessionKey = this.getSessionKey(sessionId);
      const userSessionsKey = this.getUserSessionsKey(session.userId);

      const pipeline = client.pipeline();
      pipeline.del(sessionKey);
      pipeline.srem(userSessionsKey, sessionId);

      await pipeline.exec();

      this.logger.debug(`Session deleted: ${sessionId}`);
    } catch (error) {
      this.logger.error(`Error deleting session ${sessionId}:`, error);
    }
  }

  /**
   * Get all sessions for a user
   */
  async getUserSessions(userId: string): Promise<SessionData[]> {
    try {
      const client = this.redisService.getClient();
      const userSessionsKey = this.getUserSessionsKey(userId);
      const sessionIds = await client.smembers(userSessionsKey);

      if (sessionIds.length === 0) return [];

      const sessionKeys = sessionIds.map(id => this.getSessionKey(id));
      const sessionDataArray = await client.mget(...sessionKeys);

      const sessions: SessionData[] = [];
      for (let i = 0; i < sessionDataArray.length; i++) {
        const data = sessionDataArray[i];
        if (data) {
          try {
            sessions.push(JSON.parse(data) as SessionData);
          } catch (error) {
            this.logger.warn(`Invalid session data for ${sessionIds[i]}`);
            // Clean up invalid session
            await this.deleteSession(sessionIds[i]);
          }
        }
      }

      return sessions;
    } catch (error) {
      this.logger.error(`Error getting user sessions for ${userId}:`, error);
      return [];
    }
  }

  /**
   * Delete all sessions for a user
   */
  async deleteUserSessions(userId: string): Promise<void> {
    try {
      const client = this.redisService.getClient();
      const userSessionsKey = this.getUserSessionsKey(userId);
      const sessionIds = await client.smembers(userSessionsKey);

      if (sessionIds.length === 0) return;

      const sessionKeys = sessionIds.map(id => this.getSessionKey(id));
      const pipeline = client.pipeline();

      // Delete all session keys
      sessionKeys.forEach(key => pipeline.del(key));
      
      // Delete user sessions set
      pipeline.del(userSessionsKey);

      await pipeline.exec();

      this.logger.debug(`All sessions deleted for user: ${userId} (${sessionIds.length} sessions)`);
    } catch (error) {
      this.logger.error(`Error deleting user sessions for ${userId}:`, error);
    }
  }

  /**
   * Check if session exists and is valid
   */
  async isValidSession(sessionId: string): Promise<boolean> {
    try {
      const client = this.redisService.getClient();
      const sessionKey = this.getSessionKey(sessionId);
      const exists = await client.exists(sessionKey);
      return exists === 1;
    } catch (error) {
      this.logger.error(`Error checking session validity ${sessionId}:`, error);
      return false;
    }
  }

  /**
   * Extend session TTL
   */
  async extendSession(sessionId: string, ttl: number = this.defaultTTL): Promise<void> {
    try {
      const session = await this.getSession(sessionId);
      if (!session) return;

      const client = this.redisService.getClient();
      const sessionKey = this.getSessionKey(sessionId);
      const userSessionsKey = this.getUserSessionsKey(session.userId);

      const pipeline = client.pipeline();
      pipeline.expire(sessionKey, ttl);
      pipeline.expire(userSessionsKey, ttl);

      await pipeline.exec();

      this.logger.debug(`Session extended: ${sessionId} (TTL: ${ttl}s)`);
    } catch (error) {
      this.logger.error(`Error extending session ${sessionId}:`, error);
    }
  }

  /**
   * Clean up expired sessions
   */
  async cleanupExpiredSessions(): Promise<number> {
    try {
      const client = this.redisService.getClient();
      const pattern = `${this.sessionPrefix}:*`;
      const keys = await client.keys(pattern);

      let cleanedCount = 0;
      for (const key of keys) {
        const ttl = await client.ttl(key);
        if (ttl === -2) { // Key doesn't exist
          cleanedCount++;
        }
      }

      this.logger.debug(`Cleaned up ${cleanedCount} expired sessions`);
      return cleanedCount;
    } catch (error) {
      this.logger.error('Error cleaning up expired sessions:', error);
      return 0;
    }
  }

  private async updateLastActivity(sessionId: string, sessionData: SessionData): Promise<void> {
    try {
      const updatedData = {
        ...sessionData,
        lastActivity: new Date(),
      };

      const client = this.redisService.getClient();
      const sessionKey = this.getSessionKey(sessionId);
      const ttl = await client.ttl(sessionKey);

      if (ttl > 0) {
        await client.setex(sessionKey, ttl, JSON.stringify(updatedData));
      }
    } catch (error) {
      this.logger.warn(`Error updating last activity for session ${sessionId}:`, error);
    }
  }

  private getSessionKey(sessionId: string): string {
    return `${this.sessionPrefix}:${sessionId}`;
  }

  private getUserSessionsKey(userId: string): string {
    return `${this.userSessionsPrefix}:${userId}`;
  }
}