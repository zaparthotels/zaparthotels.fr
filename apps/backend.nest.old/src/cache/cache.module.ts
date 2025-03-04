import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { CacheService } from './cache.service';

@Module({
  imports: [
    CacheModule.register({
      isGlobal: true,
    }),
  ],
  providers: [CacheService],
  exports: [CacheService],
})
export class CacheConfigModule {}
