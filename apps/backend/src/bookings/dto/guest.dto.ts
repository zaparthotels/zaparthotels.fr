import { IGuest } from '@zaparthotels/types';
import {
  IsOptional,
  IsMongoId,
  IsString,
  IsEmail,
  IsPhoneNumber,
} from 'class-validator';
import { Types } from 'mongoose';

export class GuestDto implements IGuest {
  @IsOptional()
  @IsMongoId()
  _id?: Types.ObjectId;

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsOptional()
  @IsPhoneNumber()
  phone?: string;

  @IsOptional()
  @IsString()
  locale?: string;
}
