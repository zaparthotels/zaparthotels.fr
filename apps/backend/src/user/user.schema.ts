import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IUser, TRole } from '@tousinclus/types';
import { Document } from 'mongoose';

@Schema()
export class User extends Document implements IUser {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  roles: TRole[];
}

export const UserSchema = SchemaFactory.createForClass(User);
