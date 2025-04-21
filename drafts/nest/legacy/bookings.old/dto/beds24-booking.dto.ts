import {
  IsString,
  IsNumber,
  IsEmail,
  IsOptional,
  IsDateString,
} from 'class-validator';

export class Beds24BookingDto {
  @IsNumber()
  id: number;

  @IsString()
  status: string;

  @IsDateString()
  arrival: string;

  @IsDateString()
  departure: string;

  @IsOptional()
  @IsDateString()
  arrivalTime: string;

  @IsOptional()
  @IsDateString()
  departureTime: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsOptional()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone: string;

  @IsOptional()
  @IsString()
  mobile?: string;
}
