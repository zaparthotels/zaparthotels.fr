import { PartialType } from '@nestjs/mapped-types';
import { IsDate, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateBookingDto } from './create-booking.dto';
import { AdditionalPropertiesDto } from './additional-properties.dto';
import type { TBooking } from '@zaparthotels/types';

export class UpdateBookingDto extends PartialType(CreateBookingDto) {
  @IsDate()
  updatedAt?: TBooking['updatedAt'];

  @IsOptional()
  @ValidateNested()
  @Type(() => AdditionalPropertiesDto)
  additionalProperties?: AdditionalPropertiesDto;
}
