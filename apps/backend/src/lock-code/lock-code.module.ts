import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LockCodeService } from './lock-code.service';
import { CacheModule } from '@nestjs/cache-manager';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [ConfigModule, CacheModule.register(), HttpModule],
  providers: [LockCodeService],
  exports: [LockCodeService],
})
export class LockCodeModule {}
