import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { MailService } from './mail.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    BullModule.registerQueue({
      name: 'mail-queue',
      defaultJobOptions: {
        attempts: 7,
        backoff: {
          type: 'exponential',
          delay: 10000,
        },
      },
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
