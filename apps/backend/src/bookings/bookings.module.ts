import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BookingsService } from './bookings.service';
import { BookingSchema } from './schemas/booking.schema';
import { Beds24Module } from 'src/beds24/beds24.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Booking', schema: BookingSchema }]),
    Beds24Module,
  ],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}
