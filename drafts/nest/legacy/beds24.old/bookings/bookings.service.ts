import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Beds24Service } from '../beds24.service';
import { FindOneBookingDto } from './dto/response/find-one-booking.dto';
import { validateOrReject } from 'class-validator';

@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name);

  constructor(private readonly beds24Service: Beds24Service) {}

  async findOne(id: string): Promise<FindOneBookingDto> {
    const url = new URL('bookings', this.beds24Service.BASE_URL);
    url.searchParams.set('id', id);

    try {
      // Fetch the booking details
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          token: await this.beds24Service.getToken(),
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        this.logger.error(
          `Beds24 API error: ${response.status} ${response.statusText}`,
        );
        throw new InternalServerErrorException(
          `Beds24 API error: ${response.statusText}`,
        );
      }

      const responseData = await response.json();

      if (!responseData || !responseData.data) {
        throw new InternalServerErrorException('Invalid API response data');
      }

      const booking: FindOneBookingDto = responseData.data[0];
      const dto = Object.assign(new FindOneBookingDto(), booking);

      // Validate DTO
      await validateOrReject(dto);

      // Return the validated booking data
      return booking;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error fetching booking: ${message}`, error);
      throw new InternalServerErrorException(
        `Error fetching booking: ${message}`,
      );
    }
  }
}
