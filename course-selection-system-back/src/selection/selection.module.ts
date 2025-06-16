import { Module } from '@nestjs/common';
import { SelectionController } from './selection.controller';
import { SelectionService } from './selection.service';

@Module({
  controllers: [SelectionController],
  providers: [SelectionService],
})
export class SelectionModule {}