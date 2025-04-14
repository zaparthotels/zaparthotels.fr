import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { FLOW_ARRIVAL_QUEUE } from './constants';
import { BookingsService } from 'src/bookings/bookings.service';
import { MongoIdPipe } from 'src/pipes/mongo-id/mongo-id.pipe';
import { ArrivalFlow } from './arrival.flow';
import { TFlowStatus } from '@zaparthotels/types';

type TJobData = {
  bookingId: string;
  status: TFlowStatus;
};

@Processor(FLOW_ARRIVAL_QUEUE)
export class ArrivalProcessor extends WorkerHost {
  private readonly logger = new Logger(ArrivalProcessor.name);

  constructor(
    private readonly bookingService: BookingsService,
    private readonly mongoIdPipe: MongoIdPipe,
  ) {
    super();
  }

  async process(job: Job<TJobData>): Promise<void> {
    const booking = await this.bookingService.findOne(
      this.mongoIdPipe.transform(job.data.bookingId),
    );

    await this.bookingService.updateFlow(booking, {
      name: ArrivalFlow.name,
      status: job.data.status,
    });

    this.logger.log(`Job ${job.id}. Arrival flow completed.`);
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`Job ${job.id}. Arrival flow executed successfully.`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.log(
      `Job ${job.id}. Failed to run arrival flow ${error.message}.`,
    );
  }
}
