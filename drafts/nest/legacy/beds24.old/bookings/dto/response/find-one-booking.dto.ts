import { IsString, IsNumber, IsDateString, IsOptional } from 'class-validator';

export class FindOneBookingDto {
  @IsNumber()
  id: number;

  @IsOptional()
  @IsNumber()
  masterId: number | null;

  @IsNumber()
  propertyId: number;

  @IsNumber()
  roomId: number;

  @IsNumber()
  unitId: number;

  @IsNumber()
  roomQty: number;

  @IsString()
  status: string;

  @IsString()
  subStatus: string;

  @IsDateString()
  arrival: string;

  @IsDateString()
  departure: string;

  @IsNumber()
  numAdult: number;

  @IsNumber()
  numChild: number;

  @IsString()
  title: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  @IsOptional()
  email: string;

  @IsString()
  phone: string;

  @IsString()
  @IsOptional()
  mobile: string;

  @IsString()
  @IsOptional()
  fax: string;

  @IsString()
  @IsOptional()
  company: string;

  @IsString()
  @IsOptional()
  address: string;

  @IsString()
  @IsOptional()
  city: string;

  @IsString()
  @IsOptional()
  state: string;

  @IsString()
  @IsOptional()
  postcode: string;

  @IsString()
  country: string;

  @IsString()
  country2: string;

  @IsString()
  @IsOptional()
  arrivalTime: string;

  @IsString()
  @IsOptional()
  voucher: string;

  @IsNumber()
  statusCode: number;

  @IsString()
  lang: string;

  @IsString()
  referer: string;

  @IsString()
  refererEditable: string;

  @IsString()
  channel: string;

  @IsNumber()
  apiSourceId: number;

  @IsString()
  apiSource: string;

  @IsString()
  apiReference: string;

  @IsOptional()
  @IsNumber()
  invoiceeId: number | null;

  @IsDateString()
  bookingTime: string;

  @IsDateString()
  modifiedTime: string;

  @IsOptional()
  @IsDateString()
  cancelTime: string | null;

  @IsNumber()
  price: number;
}
