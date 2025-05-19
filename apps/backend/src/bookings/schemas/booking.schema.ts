import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import {
  IBooking,
  IDates,
  IFlow,
  IGuest,
  ILockCode,
  TBookingStatus,
  TFlowStatus,
} from '@zaparthotels/types';

@Schema()
class Guest implements IGuest {
  @Prop()
  firstName?: string;

  @Prop()
  lastName?: string;

  @Prop()
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
class Flow implements IFlow {
  @Prop({ required: true, index: true })
  name: string;

  @Prop({ required: true })
  status: TFlowStatus;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ required: true, type: Date })
  updatedAt: Date;
}

@Schema()
export class BookingDocument extends Document implements IBooking {
  @Prop({ required: true, index: true })
  beds24id: string;

  @Prop({ required: true, index: true })
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

  @Prop({ type: [LockCode] })
  lockCodes?: LockCode[];

  @Prop({ type: [Flow] })
  flows?: Flow[];
}

export const BookingSchema = SchemaFactory.createForClass(BookingDocument);
