import {
  IsString,
  IsInt,
  ValidateNested,
  IsEnum,
  IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TBooking } from '@zaparthotels/types';
import { GuestDto } from './guest.dto';

export class CreateBookingDto {
  @IsString()
  beds24id: TBooking['beds24id'];

  @ValidateNested()
  @Type(() => GuestDto)
  guest: GuestDto;

  @ValidateNested()
  @Type(() => Dates)
  dates: Dates;

  @IsEnum(['confirmed', 'request', 'new', 'cancelled', 'black', 'inquiry'])
  status: 'confirmed' | 'request' | 'new' | 'cancelled' | 'black' | 'inquiry';

  @IsDate()
  createdAt?: TBooking['createdAt'];

  @IsDate()
  updatedAt?: TBooking['updatedAt'];
}

class Dates {
  @IsInt()
  checkIn: TBooking['dates']['checkIn'];

  @IsInt()
  checkOut: TBooking['dates']['checkOut'];
}
