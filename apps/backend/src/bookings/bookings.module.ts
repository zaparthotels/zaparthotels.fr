import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BookingsService } from './bookings.service';
import { BookingSchema } from './schemas/booking.schema';
import { DirectusModule } from 'src/directus/directus.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Booking', schema: BookingSchema }]),
    DirectusModule,
  ],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}
