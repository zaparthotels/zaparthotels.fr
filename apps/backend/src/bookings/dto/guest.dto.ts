import { IsString, IsEmail, IsPhoneNumber, IsOptional } from 'class-validator';
import type { TGuest } from '@zaparthotels/types';

export class GuestDto {
  @IsString()
  firstName: TGuest['firstName'];

  @IsString()
  lastName: TGuest['lastName'];

  @IsEmail()
  email: TGuest['email'];

  @IsOptional()
  @IsPhoneNumber()
  phone: TGuest['phone'];

  @IsString()
  locale?: TGuest['locale'];
}
