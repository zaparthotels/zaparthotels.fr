import {
  IsString,
  IsOptional,
  IsDate,
  IsNotEmpty,
  ValidateNested,
  IsEnum,
  IsMongoId,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  IBooking,
  IFlow,
  ILockCode,
  TBookingStatus,
} from '@zaparthotels/types';
import { Types } from 'mongoose';
import { GuestDto } from './guest.dto';
import { DatesDto } from './dates.dto';
import { LockCodeDto } from 'src/lock-code/dto/lock-code.dto';
import { FlowDto } from 'src/flows/dto/flow.dto';

export class BookingDto implements IBooking {
  @IsOptional()
  @IsMongoId()
  _id?: Types.ObjectId;

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

  @IsEnum(TBookingStatus)
  @IsNotEmpty()
  status: TBookingStatus;

  @IsDate()
  @Type(() => Date)
  createdAt: Date;

  @IsDate()
  @Type(() => Date)
  updatedAt: Date;

  @IsOptional()
  @ValidateNested()
  @Type(() => LockCodeDto)
  lockCode?: ILockCode;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => FlowDto)
  flows?: IFlow[];
}
