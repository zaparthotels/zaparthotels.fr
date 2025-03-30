import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule } from '@nestjs/config';
import { LockCodeService } from './lock-code.service';
import { CacheModule } from '@nestjs/cache-manager';
import { HttpModule } from '@nestjs/axios';
import { LockCodeProcessor } from './lock-code.processor';
import { SMART_LOCK_QUEUE } from './constants';

@Module({
  imports: [
    ConfigModule,
    CacheModule.register(),
    HttpModule,
    BullModule.registerQueue({
      name: SMART_LOCK_QUEUE,
      defaultJobOptions: {
        attempts: 8,
        backoff: {
          type: 'exponential',
          delay: 10000,
        },
      },
    }),
  ],
  providers: [LockCodeService, LockCodeProcessor],
  exports: [LockCodeService],
})
export class LockCodeModule {}
