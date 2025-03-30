import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { IBooking, TBookingStatus } from '@zaparthotels/types';

@Schema()
class Guest {
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
class Dates {
  @Prop({ required: true, type: Date })
  checkIn: Date;

  @Prop({ required: true, type: Date })
  checkOut: Date;
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

  @Prop({ type: Object, default: {} })
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  additionalProperties?: Record<string, any>;

  @Prop({ required: true })
  status: TBookingStatus;

  @Prop({ required: true, type: Date })
  createdAt: Date;

  @Prop({ required: true, type: Date })
  updatedAt: Date;
}

export const BookingSchema = SchemaFactory.createForClass(BookingDocument);
