import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import {
  IBooking,
  IDates,
  IGuest,
  ILockCode,
  TBookingStatus,
} from '@zaparthotels/types';

@Schema()
class Guest implements IGuest {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, index: true })
  email: string;

  @Prop()
  phone?: string;

  @Prop()
  locale?: string;
}

@Schema()
class Dates implements IDates {
  @Prop({ required: true, type: Date })
  checkIn: Date;

  @Prop({ required: true, type: Date })
  checkOut: Date;
}

@Schema()
class LockCode implements ILockCode {
  @Prop({ required: true })
  lockId: string;

  @Prop()
  code?: string;

  @Prop()
  codeId?: string;

  @Prop({ required: true, type: Date })
  startsAt: Date;

  @Prop({ required: true, type: Date })
  expiresAt: Date;
}

@Schema()
export class BookingDocument extends Document implements IBooking {
  @Prop({ required: true, unique: true })
  beds24id: string;

  @Prop({ required: true, unique: true })
  propertyId: string;

  @Prop({ type: Guest, required: true })
  guest: Guest;

  @Prop({ type: Dates, required: true })
  dates: Dates;

  @Prop({ required: true })
  status: TBookingStatus;

  @Prop({ required: true, type: Date })
  createdAt: Date;

  @Prop({ required: true, type: Date })
  updatedAt: Date;

  @Prop({ type: LockCode })
  lockCode?: LockCode;
}

export const BookingSchema = SchemaFactory.createForClass(BookingDocument);
