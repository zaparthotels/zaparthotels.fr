import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { TBooking, TGuest } from '@zaparthotels/types';

@Schema()
export class Booking extends Document implements Omit<TBooking, 'id'> {
  @Prop({ required: true })
  beds24id: TBooking['beds24id'];

  @Prop({ type: Object, required: true })
  guest: TGuest;

  @Prop({ type: Object, required: true })
  dates: {
    checkIn: TBooking['dates']['checkIn'];
    checkOut: TBooking['dates']['checkOut'];
  };

  @Prop({ type: Object })
  additionalProperties?: TBooking['additionalProperties'];

  @Prop({
    enum: ['confirmed', 'request', 'new', 'cancelled', 'black', 'inquiry'],
    required: true,
  })
  status: TBooking['status'];

  @Prop({ default: Date.now })
  createdAt: TBooking['createdAt'];

  @Prop({ default: Date.now })
  updatedAt: TBooking['updatedAt'];
}

export const BookingSchema = SchemaFactory.createForClass(Booking);
