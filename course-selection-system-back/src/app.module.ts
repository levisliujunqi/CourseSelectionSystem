import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { CourseModule } from './course/course.module';
import { SelectionModule } from './selection/selection.module';
import { ormconfig } from './config/ormconfig';

@Module({
  imports: [
    TypeOrmModule.forRoot(ormconfig),
    UserModule,
    CourseModule,
    SelectionModule,
  ],
})
export class AppModule {}