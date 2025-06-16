import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SelectionController } from './selection.controller';
import { SelectionService } from './selection.service';
import { Selection } from './entities/selection.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([Selection]),
  ],
  controllers: [SelectionController],
  providers: [SelectionService],
})
export class SelectionModule {}