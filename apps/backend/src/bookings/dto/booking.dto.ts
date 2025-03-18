import {
  IsString,
  IsEmail,
  IsOptional,
  IsPhoneNumber,
  IsDate,
  IsObject,
  IsNotEmpty,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { IBooking, TBookingStatus } from '@zaparthotels/types';

class GuestDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsPhoneNumber(null)
  phone?: string;

  @IsOptional()
  @IsString()
  locale?: string;
}

class DatesDto {
  @IsDate()
  @Type(() => Date)
  checkIn: Date;

  @IsDate()
  @Type(() => Date)
  checkOut: Date;
}

export class BookingDto implements IBooking {
  @IsString()
  @IsNotEmpty()
  beds24id: string;

  @ValidateNested()
  @Type(() => GuestDto)
  guest: GuestDto;

  @ValidateNested()
  @Type(() => DatesDto)
  dates: DatesDto;

  @IsOptional()
  @IsObject()
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  additionalProperties?: Record<string, any>;

  @IsEnum(TBookingStatus)
  @IsNotEmpty()
  status: TBookingStatus;

  @IsDate()
  @Type(() => Date)
  createdAt: Date;

  @IsDate()
  @Type(() => Date)
  updatedAt: Date;
}
