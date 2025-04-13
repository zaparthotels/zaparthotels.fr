import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BookingDocument } from './schemas/booking.schema';
import { WebhookBeds24PayloadDto } from './dto/create-update-booking.dto';
import { BookingDto } from './dto/booking.dto';
import { plainToClass } from 'class-transformer';
import { DirectusService } from 'src/directus/directus.service';
import { DateUtils } from 'src/utils/DateUtils';
import parsePhoneNumberFromString, { CountryCode } from 'libphonenumber-js';

@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name);

  constructor(
    @InjectModel('Booking')
    private readonly bookingModel: Model<BookingDocument>,
    private readonly directusService: DirectusService,
  ) {}

  async findOne(_id: Types.ObjectId): Promise<BookingDto | null> {
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
      const booking = await this.bookingModel
        .findOneAndUpdate({ beds24id }, createUpdateBookingDto, { new: true })
        .exec();

      return plainToClass(BookingDto, booking.toObject());
    }

    const newBooking = new this.bookingModel(createUpdateBookingDto);
    const result = await newBooking.save();

    return plainToClass(BookingDto, result.toObject());
  }

  async update(bookingDto: BookingDto): Promise<BookingDto> {
    const booking = await this.bookingModel.findByIdAndUpdate(
      bookingDto._id,
      bookingDto,
      { new: true },
    );

    if (!booking) {
      throw new Error('Booking not found');
    }

    return plainToClass(BookingDto, booking.toObject());
  }

  async transformWebhookPayload(
    payload: WebhookBeds24PayloadDto,
  ): Promise<BookingDto> {
    const { defaultArrivalTime, defaultDepartureTime } =
      await this.directusService.getConfig();

    const { booking } = payload;

    // Conversion des dates ISO en objets Date
    const checkInDate = new DateUtils(booking.arrival);
    const checkOutDate = new DateUtils(booking.departure);
    const createdAt = new Date(booking.bookingTime);
    const updatedAt = new Date(booking.modifiedTime);

    checkInDate.setTimeFromString(defaultArrivalTime);
    checkOutDate.setTimeFromString(defaultDepartureTime);

    const getLocaleIntl = (lang: string, country2?: string): Intl.Locale => {
      let localeIntl: Intl.Locale;

      try {
        localeIntl = new Intl.Locale(`${lang}-${country2}`).maximize();
      } catch (error) {
        this.logger.warn(
          `Invalid locale format "${lang}-${country2}". Defaulting to "${lang}"`,
          error.message,
        );
        localeIntl = new Intl.Locale(lang).maximize();
      }

      return localeIntl;
    };

    const localeIntl = getLocaleIntl(booking.lang, booking.country2);

    const normalizedPhone = parsePhoneNumberFromString(
      booking.phone,
      (localeIntl.region as CountryCode) || 'FR',
    );

    // Construction du DTO pour la création/mise à jour
    return {
      beds24id: booking.id.toString(),
      propertyId: booking.propertyId.toString(),
      guest: {
        firstName: booking.firstName,
        lastName: booking.lastName,
        email: booking.email,
        phone: normalizedPhone.formatInternational(),
        locale: `${localeIntl.language}-${localeIntl.region}`,
      },
      dates: {
        checkIn: checkInDate,
        checkOut: checkOutDate,
      },
      status: booking.status,
      createdAt: createdAt,
      updatedAt: updatedAt,
    };
  }
}
