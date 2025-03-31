import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsISO8601,
  IsEmail,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TBookingStatus } from '@zaparthotels/types';

class WebhookBookingDto {
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @IsNumber()
  @IsNotEmpty()
  propertyId: number;

  @IsEnum(TBookingStatus)
  @IsNotEmpty()
  status: TBookingStatus;

  @IsISO8601()
  @IsNotEmpty()
  arrival: string;

  @IsISO8601()
  @IsNotEmpty()
  departure: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsOptional()
  phone: string;

  @IsString()
  @IsOptional()
  lang: string;

  @IsString()
  @IsOptional()
  country2: string;

  @IsISO8601()
  @IsNotEmpty()
  bookingTime: string;

  @IsISO8601()
  @IsNotEmpty()
  modifiedTime: string;
}

export class WebhookBeds24PayloadDto {
  @IsISO8601()
  @IsNotEmpty()
  timeStamp: string;

  @ValidateNested()
  @Type(() => WebhookBookingDto)
  @IsNotEmpty()
  booking: WebhookBookingDto;
}
