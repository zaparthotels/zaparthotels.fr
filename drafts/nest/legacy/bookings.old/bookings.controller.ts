import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { Beds24AuthGuard } from './guards/beds24-auth.guard';
import { Beds24BookingDto } from './dto/beds24-booking.dto';
import { TBooking } from '@zaparthotels/types';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post(process.env.WEBHOOK_BED24_REFRESH_ENDPOINT)
  @UseGuards(Beds24AuthGuard)
  async handleBeds24Webhook(@Body() data: { booking: Beds24BookingDto }) {
    const bookingData = data.booking;

    const dto: CreateBookingDto | UpdateBookingDto = {
      beds24id: bookingData.id.toString(),
      guest: {
        firstName: bookingData.firstName,
        lastName: bookingData.lastName,
        email: bookingData.email,
        phone: bookingData.phone || bookingData.mobile,
      },
      dates: {
        checkIn: new Date(bookingData.arrival),
        checkOut: new Date(bookingData.departure),
      },
      status: bookingData.status as TBooking['status'],
    };

    const existingBooking = await this.bookingsService.findOne(
      bookingData.id.toString(),
    );

    if (existingBooking) {
      return this.bookingsService.update(
        bookingData.id.toString(),
        dto as UpdateBookingDto,
      );
    }

    return this.bookingsService.create(dto as CreateBookingDto);
  }
}
