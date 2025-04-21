import { IGuest } from '@zaparthotels/types';
import {
  IsOptional,
  IsMongoId,
  IsString,
  IsNotEmpty,
  IsEmail,
  IsPhoneNumber,
} from 'class-validator';
import { Types } from 'mongoose';

export class GuestDto implements IGuest {
  @IsOptional()
  @IsMongoId()
  _id?: Types.ObjectId;

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
