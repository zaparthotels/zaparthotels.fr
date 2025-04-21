import { Module } from '@nestjs/common';
import { ArrivalModule } from './arrival/arrival.module';

const exportedModules = [ArrivalModule];

@Module({
  imports: [...exportedModules],
  exports: [...exportedModules],
})
export class FlowsModule {}
