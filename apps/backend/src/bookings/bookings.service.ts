import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BookingDocument } from './schemas/booking.schema';
import { WebhookBeds24PayloadDto } from './dto/create-update-booking.dto';
import { BookingDto } from './dto/booking.dto';
import { plainToClass } from 'class-transformer';

@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name);

  constructor(
    @InjectModel('Booking')
    private readonly bookingModel: Model<BookingDocument>,
  ) {}

  async findOne(_id: string): Promise<BookingDto | null> {
    const booking = await this.bookingModel.findById(_id).exec();
    return booking ? plainToClass(BookingDto, booking.toObject()) : null;
  }

  async createOrUpdate(
    createUpdateBookingDto: BookingDto,
  ): Promise<BookingDto> {
    const { beds24id } = createUpdateBookingDto;

    const existingBooking = await this.bookingModel
      .findOne({ beds24id })
      .exec();

    if (existingBooking) {
      // Mise à jour
      const booking = this.bookingModel
        .findOneAndUpdate({ beds24id }, createUpdateBookingDto, { new: true })
        .exec();

      return plainToClass(BookingDto, (await booking).toObject());
    }

    // Création
    const newBooking = new this.bookingModel(createUpdateBookingDto);
    const result = newBooking.save();

    return plainToClass(BookingDto, (await result).toObject());
  }

  transformWebhookPayload(payload: WebhookBeds24PayloadDto): BookingDto {
    const { booking } = payload;

    // Conversion des dates ISO en objets Date
    const checkInDate = new Date(booking.arrival);
    const checkOutDate = new Date(booking.departure);
    const createdAt = new Date(booking.bookingTime);
    const updatedAt = new Date(booking.modifiedTime);

    // TODO: utiliser valeurs Directus
    checkInDate.setHours(16);
    checkOutDate.setHours(11);

    // Nettoyage du numéro de téléphone (suppression des espaces)
    const cleanPhone = booking.phone
      ? booking.phone.replace(/\s+/g, '')
      : undefined;

    // Construction du DTO pour la création/mise à jour
    return {
      beds24id: booking.id.toString(),
      propertyId: booking.propertyId.toString(),
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
