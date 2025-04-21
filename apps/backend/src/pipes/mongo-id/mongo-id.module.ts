import { Module } from '@nestjs/common';
import { MongoIdPipe } from './mongo-id.pipe';

@Module({
  providers: [MongoIdPipe],
  exports: [MongoIdPipe],
})
export class MongoIdModule {}
