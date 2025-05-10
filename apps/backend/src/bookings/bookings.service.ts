import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BookingDocument } from './schemas/booking.schema';
import { WebhookBeds24PayloadDto } from './dto/create-update-booking.dto';
import { BookingDto } from './dto/booking.dto';
import { plainToClass } from 'class-transformer';
import { DateUtils } from 'src/utils/DateUtils';
import parsePhoneNumberFromString, { CountryCode } from 'libphonenumber-js';
import { IFlow } from '@zaparthotels/types';
import { Beds24Service } from 'src/beds24/beds24.service';

@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name);

  constructor(
    @InjectModel('Booking')
    private readonly bookingModel: Model<BookingDocument>,
    private readonly beds24Service: Beds24Service,
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
    const booking = await this.bookingModel
      .findByIdAndUpdate(bookingDto._id, bookingDto, { new: true })
      .exec();

    if (!booking) {
      throw new Error('Booking not found');
    }

    return plainToClass(BookingDto, booking.toObject());
  }

  async addFlow(
    bookingDto: BookingDto,
    flow: Omit<IFlow, 'createdAt' | 'updatedAt'>,
  ): Promise<BookingDto> {
    if (bookingDto.flows.find((f) => f.name === flow.name)) {
      this.logger.warn(
        `Flow ${flow.name} already exists for booking ${bookingDto._id}`,
      );
      return;
    }

    const flowWithTimestamps: IFlow = {
      ...flow,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    bookingDto.flows.push(flowWithTimestamps);

    const booking = await this.bookingModel
      .findByIdAndUpdate(bookingDto._id, bookingDto, { new: true })
      .exec();

    return plainToClass(BookingDto, booking.toObject());
  }

  async updateFlow(
    bookingDto: BookingDto,
    flow: Omit<IFlow, 'createdAt' | 'updatedAt'>,
  ): Promise<BookingDto> {
    const existingFlow = bookingDto.flows.find((f) => f.name === flow.name);

    const flowWithTimestamps: IFlow = {
      ...existingFlow,
      ...flow,
      updatedAt: new Date(),
    };

    bookingDto.flows = [
      ...bookingDto.flows.filter((f) => f.name !== flow.name),
      flowWithTimestamps,
    ];

    const booking = await this.bookingModel
      .findByIdAndUpdate(bookingDto._id, bookingDto, { new: true })
      .exec();

    return plainToClass(BookingDto, booking.toObject());
  }

  async getFlowByName(
    bookingDto: BookingDto,
    flowName: string,
  ): Promise<IFlow | null> {
    const flow = bookingDto.flows.find((f) => f.name === flowName);

    if (!flow) {
      this.logger.warn(
        `Flow ${flowName} not found for booking ${bookingDto._id}`,
      );
      return null;
    }

    return flow;
  }

  async transformWebhookPayload(
    payload: WebhookBeds24PayloadDto,
  ): Promise<BookingDto> {
    const { booking } = payload;

    const checkInDate = new DateUtils(booking.arrival);
    const checkOutDate = new DateUtils(booking.departure);
    const createdAt = new Date(booking.bookingTime);
    const updatedAt = new Date(booking.modifiedTime);

    const beds24property = await this.beds24Service.getProperty(
      booking.propertyId.toString(),
    );

    const [arrivalTime, departureTime] = [
      beds24property.checkInStart,
      beds24property.checkOutEnd,
    ];

    checkInDate.setTimeFromString(arrivalTime);
    checkOutDate.setTimeFromString(departureTime);

    const getLocaleIntl = (
      inputLang?: string,
      inputRegion?: string,
      phoneNumber?: string,
    ): Intl.Locale => {
      let lang = inputLang;
      let region = inputRegion;

      if (!lang && !region && phoneNumber) {
        const phone = parsePhoneNumberFromString(phoneNumber, 'FR');
        if (phone) {
          region = phone.country;
        }
      }

      if (!lang && region) {
        try {
          const locale = new Intl.Locale(`und-${region}`).maximize();
          lang = locale.language;
        } catch (error) {
          this.logger.warn(
            `Failed to deduce language from region "${region}".`,
            error.message,
          );
        }
      }

      let localeIntl: Intl.Locale;

      try {
        if (lang && region) {
          localeIntl = new Intl.Locale(`${lang}-${region}`).maximize();
        } else if (lang) {
          localeIntl = new Intl.Locale(lang).maximize();
        } else {
          localeIntl = new Intl.Locale('en-US').maximize();
        }
      } catch (error) {
        this.logger.warn(
          `Invalid locale format "${lang}-${region}". Defaulting to "en-US"`,
          error.message,
        );
        localeIntl = new Intl.Locale('en-US').maximize();
      }

      return localeIntl;
    };

    const localeIntl = getLocaleIntl(
      booking.lang,
      booking.country2,
      booking.phone,
    );

    const normalizedPhone = parsePhoneNumberFromString(
      booking.phone,
      (localeIntl.region as CountryCode) || 'FR',
    );

    return {
      beds24id: booking.id.toString(),
      propertyId: booking.propertyId.toString(),
      guest: {
        firstName: booking.firstName,
        lastName: booking.lastName,
        email: booking.email,
        phone: normalizedPhone?.formatInternational(),
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
