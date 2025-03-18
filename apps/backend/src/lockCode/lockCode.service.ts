import { Injectable, Logger } from '@nestjs/common';
import {
  InjectQueue,
  Processor,
  OnWorkerEvent,
  WorkerHost,
} from '@nestjs/bullmq';
import { Queue, Job } from 'bullmq';
import { ILockCode } from '@zaparthotels/types';
import { ConfigService } from '@nestjs/config';

@Injectable()
@Processor('lock-code-queue')
export class LockCodeService extends WorkerHost {
  private readonly logger = new Logger(LockCodeService.name);

  constructor(
    private readonly configService: ConfigService,
    @InjectQueue('lock-code-queue') private lockCodeQueue: Queue,
  ) {
    super();
  }

  async createCode({ lockId, expiresAt }: ILockCode): Promise<Job<ILockCode>> {
    return this.lockCodeQueue.add('create-lock-code', {
      lockId,
      expiresAt,
    });
  }

  async process(job: Job<ILockCode>): Promise<ILockCode> {
    const { lockId, expiresAt } = job.data;
    const createdAt = new Date();
    const duration = Math.ceil(
      (expiresAt.getTime() - createdAt.getTime()) / 3600000,
    );
    this.logger.log(
      `Job ${job.id}. Attempt ${job.attemptsMade + 1}. Retrieing lock code for ${lockId}, valid for ${duration} hours`,
    );

    return {
      lockId,
      code: 'TEST1234',
      expiresAt,
      createdAt,
    };
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`Job ${job.id}. Lock Code retrieved successfully.`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.log(
      `Job ${job.id}. Failed to retrieve Lock Code, with error ${error.message}.`,
    );
  }
}
