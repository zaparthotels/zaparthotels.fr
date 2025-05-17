import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { FLOW_DEPARTURE_QUEUE } from './constants';
import { BookingsService } from 'src/bookings/bookings.service';
import { MongoIdPipe } from 'src/pipes/mongo-id/mongo-id.pipe';
import { DepartureFlow } from './departure.flow';
import { TFlowStatus } from '@zaparthotels/types';

type TJobData = {
  bookingId: string;
  status: TFlowStatus;
};

@Processor(FLOW_DEPARTURE_QUEUE)
export class DepartureProcessor extends WorkerHost {
  private readonly logger = new Logger(DepartureProcessor.name);

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
      name: DepartureFlow.name,
      status: job.data.status,
    });

    this.logger.log(`Job ${job.id}. Departure flow completed.`);
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`Job ${job.id}. Departure flow executed successfully.`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.log(`Job ${job.id}. Failed to run departure flow:`, error);
  }
}
