import { Injectable, PipeTransform, BadRequestException } from '@nestjs/common';
import { isMongoId } from 'class-validator';
import { Types } from 'mongoose';

@Injectable()
export class MongoIdPipe implements PipeTransform {
  transform(value: string): Types.ObjectId {
    if (!isMongoId(value)) {
      throw new BadRequestException(`${value} is not a mongoId`);
    }

    return new Types.ObjectId(value);
  }
}
