import { Module } from '@nestjs/common';
import { SmsService } from './sms.service';
import { SmsWorker } from './sms.worker';

@Module({
  providers: [SmsService, SmsWorker],
  exports: [SmsService],
})
export class SmsModule {}
