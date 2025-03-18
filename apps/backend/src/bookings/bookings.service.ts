import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BookingDocument } from './schemas/booking.schema';
import { WebhookBeds24PayloadDto } from './dto/create-update-booking.dto';
import { BookingDto } from './dto/booking.dto';

@Injectable()
export class BookingsService {
  constructor(
    @InjectModel('Booking')
    private readonly bookingModel: Model<BookingDocument>,
  ) {}

  async createOrUpdate(
    createUpdateBookingDto: BookingDto,
  ): Promise<BookingDocument> {
    const { beds24id } = createUpdateBookingDto;

    const existingBooking = await this.bookingModel
      .findOne({ beds24id })
      .exec();

    if (existingBooking) {
      // Mise à jour
      return this.bookingModel
        .findOneAndUpdate({ beds24id }, createUpdateBookingDto, { new: true })
        .exec();
    }

    // Création
    const newBooking = new this.bookingModel(createUpdateBookingDto);
    return newBooking.save();
  }

  transformWebhookPayload(payload: WebhookBeds24PayloadDto): BookingDto {
    const { booking } = payload;

    // Conversion des dates ISO en objets Date
    const checkInDate = new Date(booking.arrival);
    const checkOutDate = new Date(booking.departure);
    const createdAt = new Date(booking.bookingTime);
    const updatedAt = new Date(booking.modifiedTime);

    // Nettoyage du numéro de téléphone (suppression des espaces)
    const cleanPhone = booking.phone
      ? booking.phone.replace(/\s+/g, '')
      : undefined;

    // Construction du DTO pour la création/mise à jour
    return {
      beds24id: booking.id.toString(),
      guest: {
        firstName: booking.firstName,
        lastName: booking.lastName,
        email: booking.email,
        phone: cleanPhone,
        locale: booking.lang
          ? `${booking.lang}-${booking.lang.toUpperCase()}`
          : undefined,
      },
      dates: {
        checkIn: checkInDate,
        checkOut: checkOutDate,
      },
      additionalProperties: {},
      status: booking.status,
      createdAt: createdAt,
      updatedAt: updatedAt,
    };
  }
}
