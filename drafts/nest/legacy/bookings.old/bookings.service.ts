import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { Booking } from './schemas/booking.schema';

@Injectable()
export class BookingsService {
  constructor(
    @InjectModel(Booking.name) private bookingModel: Model<Booking>,
  ) {}

  async findAll(): Promise<Booking[]> {
    return this.bookingModel.find().exec();
  }

  async findOne(id: string): Promise<Booking> {
    const booking = await this.bookingModel.findById(id).exec();
    if (!booking) throw new NotFoundException('Booking Not Found');
    return booking;
  }

  async create(createBookingDto: CreateBookingDto): Promise<Booking> {
    const newBooking = new this.bookingModel({
      ...createBookingDto,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return newBooking.save();
  }

  async update(
    id: string,
    updateBookingDto: UpdateBookingDto,
  ): Promise<Booking> {
    const updatedBooking = await this.bookingModel
      .findByIdAndUpdate(
        id,
        { ...updateBookingDto, updatedAt: new Date() },
        { new: true },
      )
      .exec();

    if (!updatedBooking) throw new NotFoundException('Booking Not Found');
    return updatedBooking;
  }

  async delete(id: string): Promise<Booking> {
    const removedBooking = await this.bookingModel.findByIdAndDelete(id).exec();
    if (!removedBooking) throw new NotFoundException('Booking Not Found');
    return removedBooking;
  }
}
