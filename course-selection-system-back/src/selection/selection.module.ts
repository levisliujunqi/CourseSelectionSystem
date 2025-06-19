import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SelectionController } from './selection.controller';
import { SelectionService } from './selection.service';
import { Selection } from './entities/selection.entity';
import { Course } from 'src/course/entities/course.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([Selection,Course]),
  ],
  controllers: [SelectionController],
  providers: [SelectionService],
})
export class SelectionModule {}