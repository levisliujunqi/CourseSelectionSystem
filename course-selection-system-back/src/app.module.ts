import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { AuthGuard } from './auth/auth.guard';
import { UserModule } from './user/user.module';
import { CourseModule } from './course/course.module';
import { SelectionModule } from './selection/selection.module';
import { ormconfig } from './config/ormconfig';

@Module({
  imports: [
    TypeOrmModule.forRoot(ormconfig),
    AuthModule,
    UserModule,
    CourseModule,
    SelectionModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: AuthGuard },    // 全局验证用户名密码
  ],
})
export class AppModule {}