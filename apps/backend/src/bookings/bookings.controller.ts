import { Controller, Post, Body, HttpCode, Logger } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { WebhookBeds24PayloadDto } from './dto/create-update-booking.dto';
import { NotificationsService } from './notifications/notifications.service';

@Controller('bookings')
export class BookingsController {
  private readonly logger = new Logger(BookingsController.name);

  constructor(
    private readonly bookingsService: BookingsService,
    private readonly notificationsService: NotificationsService,
  ) {}

  @Post()
  @HttpCode(200)
  async createOrUpdate(@Body() webhookPayload: WebhookBeds24PayloadDto) {
    this.logger.log(
      `Received webhook from Bed24: ${webhookPayload.booking.id}`,
    );

    try {
      // Transformation des données du webhook en format attendu
      const transformedData =
        this.bookingsService.transformWebhookPayload(webhookPayload);

      // Création ou mise à jour du booking
      const booking =
        await this.bookingsService.createOrUpdate(transformedData);

      this.notificationsService.createOrUpdateNotifications(booking);

      return {
        success: true,
        message: 'Booking processed successfully',
        id: booking.beds24id,
      };
    } catch (error) {
      this.logger.error(
        `Error processing webhook: ${error.message}`,
        error.stack,
      );
      return {
        success: false,
        message: 'Error processing booking data',
        error: error.message,
      };
    }
  }
}
