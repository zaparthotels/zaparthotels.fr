import { Injectable, Logger } from '@nestjs/common';
import { Worker } from 'bullmq';
import { SmsService } from './sms.service';
import { smsQueue } from './sms.config';

@Injectable()
export class SmsWorker {
  private readonly logger = new Logger(SmsWorker.name);
  private worker: Worker;

  constructor(private readonly smsService: SmsService) {
    this.worker = new Worker(
      'sms-queue',
      async (job) => {
        this.logger.log(
          `Traitement d’un job SMS pour le numéro ${job.data.phoneNumber}`,
        );
        const sendedSms = await this.smsService.sendSms(job.data.phoneNumber, job.data.message);
      },
      smsQueue,
    );

    this.worker.on('failed', (job, err) => {
      this.logger.error(`Le job ${job.id} a échoué : ${err.message}`);
    });
  }
}
