import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RedisService } from './redis.service';
import { CacheService } from './cache.service';
import { SessionService } from './session.service';
import { RateLimitService } from './rate-limit.service';

@Global()
@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],  // se não estiver configurado em outro lugar
  providers: [
    RedisService,
    CacheService,
    SessionService,
    RateLimitService,
  ],
  exports: [
    RedisService,
    CacheService,
    SessionService,
    RateLimitService,
  ],
})
export class RedisModule {}
