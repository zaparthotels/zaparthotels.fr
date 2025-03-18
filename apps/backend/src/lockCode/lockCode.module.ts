import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule } from '@nestjs/config';
import { LockCodeService } from './lockCode.service';

@Module({
  imports: [
    ConfigModule,
    BullModule.registerQueue({
      name: 'lock-code-queue',
      defaultJobOptions: {
        attempts: 8,
        backoff: {
          type: 'exponential',
          delay: 10000,
        },
      },
    }),
  ],
  providers: [LockCodeService],
  exports: [LockCodeService],
})
export class LockCodeModule {}
