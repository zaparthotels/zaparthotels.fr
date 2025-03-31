import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Logger,
  Post,
} from '@nestjs/common';
import { IBooking } from '@zaparthotels/types';
import { BookingsService } from 'src/bookings/bookings.service';
import { WebhookBeds24PayloadDto } from 'src/bookings/dto/create-update-booking.dto';
import { ArrivalFlow } from 'src/flows/arrival/arrival.flow';

@Controller('webhooks')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);

  constructor(
    private readonly bookingsService: BookingsService,
    private readonly arrivalFlow: ArrivalFlow,
  ) {}

  @Post('bookings')
  @HttpCode(200)
  async createOrUpdateBooking(
    @Body() webhookPayload: WebhookBeds24PayloadDto,
  ): Promise<IBooking> {
    this.logger.log(
      `Received webhook from Bed24: ${webhookPayload.booking.id}`,
    );

    try {
      const transformedData =
        await this.bookingsService.transformWebhookPayload(webhookPayload);

      const booking =
        await this.bookingsService.createOrUpdate(transformedData);

      await this.arrivalFlow.run(booking);

      return booking;
    } catch (error) {
      this.logger.error(
        `Error processing webhook: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException('Error processing booking data');
    }
  }
}
