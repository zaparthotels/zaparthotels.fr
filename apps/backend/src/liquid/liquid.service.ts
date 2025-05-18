import { Injectable, Logger } from '@nestjs/common';
import { ILockCode } from '@zaparthotels/types';
import { Liquid } from 'liquidjs';
import { BookingDto } from 'src/bookings/dto/booking.dto';

@Injectable()
export class LiquidService extends Liquid {
  private readonly logger = new Logger(LiquidService.name);

  setLocale(locale: string): this {
    this.registerFilter('date_locale', (date: Date) => {
      return date.toLocaleDateString(locale);
    });

    return this;
  }

  static bookingContext(booking: BookingDto) {
    const { lockCodes } = booking;

    const lockCodesByLockId = lockCodes.reduce(
      (acc, lockCode) => {
        acc[lockCode.lockId] = lockCode;
        return acc;
      },
      {} as Record<string, ILockCode>,
    );

    return {
      ...booking,
      lockCodes: lockCodesByLockId,
    };
  }
}
