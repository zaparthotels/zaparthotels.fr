import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { MESSAGE_QUEUE } from './constants';
import { Logger } from '@nestjs/common';
import { IMessage } from '@zaparthotels/types';
import { Job } from 'bullmq';
import { Beds24Service } from 'src/beds24/beds24.service';

@Processor(MESSAGE_QUEUE)
export class MessageProcessor extends WorkerHost {
  private readonly logger = new Logger(MessageProcessor.name);

  constructor(private readonly beds24Service: Beds24Service) {
    super();
  }

  async process(job: Job<IMessage>): Promise<void> {
    const { beds24id, message } = job.data;
    this.logger.log(
      `Job ${job.id}. Attempt ${job.attemptsMade + 1}. Sending message to ${beds24id}.`,
    );

    await this.beds24Service.sendMessage(beds24id, message);
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`Job ${job.id}. Message sent successfully.`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.log(
      `Job ${job.id}. Failed to send message, with error:`,
      error,
    );
  }
}
