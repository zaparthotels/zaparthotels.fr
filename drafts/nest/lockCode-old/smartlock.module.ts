import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule } from '@nestjs/config';
import { SmartlockService } from './smartlock.service';
import { CacheModule } from '@nestjs/cache-manager';
import { HttpModule } from '@nestjs/axios';
import { SMARTLOCK_QUEUE } from './constants';
import { SmartlockProducerService } from './smartlock-producer.service';
import { SmartlockConsumerService } from './smartlock-consumer.service';

@Module({
  imports: [
    ConfigModule,
    CacheModule.register(),
    HttpModule,
    BullModule.registerQueue({
      name: SMARTLOCK_QUEUE,
      defaultJobOptions: {
        attempts: 8,
        backoff: {
          type: 'exponential',
          delay: 10000,
        },
      },
    }),
  ],
  providers: [
    SmartlockService,
    SmartlockProducerService,
    SmartlockConsumerService,
  ],
  exports: [SmartlockService],
})
export class SmartlockModule {}
