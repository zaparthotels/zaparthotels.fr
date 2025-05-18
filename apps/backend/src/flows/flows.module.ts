import { Module } from '@nestjs/common';
import { ArrivalModule } from './arrival/arrival.module';
import { DepartureModule } from './departure/departure.module';

const exportedModules = [ArrivalModule, DepartureModule];

@Module({
  imports: [...exportedModules],
  exports: [...exportedModules],
})
export class FlowsModule {}
