import { Controller, Get, Param } from '@nestjs/common';
import { SmsService } from 'src/sms/sms.service';
import { BookingsService } from './bookings.service';

@Controller('bookings')
export class BookingsController {
  constructor(
    private readonly bookingsService: BookingsService,
    private readonly smsService: SmsService,
  ) {}

  @Get('/test/:id')
  async scheduleSms(@Param('id') id: string) {
    const booking = await this.bookingsService.findOne(id);

    const phoneNumber = '+33637056203';
    const message = `Hello ${booking.firstName}!`;
    const timestamp = new Date(Date.now() + 0);

    await this.smsService.scheduleSms(phoneNumber, message, timestamp);
    return booking;
  }

  @Get(':id') // GET /bookings/:id
  findOne(@Param('id') id: string) {
    // return this.bookingsService.findOne(id);
  }
}
