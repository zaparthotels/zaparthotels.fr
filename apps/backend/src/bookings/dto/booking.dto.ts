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
  IsMongoId,
} from 'class-validator';
import { Type } from 'class-transformer';
import { IBooking, TBookingStatus } from '@zaparthotels/types';
import { ObjectId } from 'mongoose';

class GuestDto {
  @IsOptional()
  @IsMongoId()
  _id?: ObjectId;

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
  @IsOptional()
  @IsMongoId()
  _id?: ObjectId;

  @IsString()
  @IsNotEmpty()
  beds24id: string;

  @IsString()
  @IsNotEmpty()
  propertyId: string;

  @ValidateNested()
  @Type(() => GuestDto)
  guest: GuestDto;

  @ValidateNested()
  @Type(() => DatesDto)
  dates: DatesDto;

  @IsOptional()
  @IsObject()
  // biome-ignore lint/suspicious/noExplicitAny: unknown
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
