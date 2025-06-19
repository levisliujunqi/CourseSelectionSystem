import { Controller, Get, Post, Body, Put, Param, Delete, ParseIntPipe, Req, Query } from '@nestjs/common';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { Course } from './entities/course.entity';
import { ForbiddenException } from '@nestjs/common';

@Controller('courses')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}
  @Get('search/:name')
  async searchByName(@Param('name') name: string): Promise<Course[]> {
    return this.courseService.searchByName(name);
  }
  
  @Post()
  create(@Body() createCourseDto: CreateCourseDto,@Req() req): Promise<Course> {
    const user=req.user;
    if(!user||user.usertype=='student'){
      throw new Error('Unauthorized');
    }
    return this.courseService.create(createCourseDto);
  }

  @Get()
  findAll(): Promise<Course[]> {
    return this.courseService.findAll();
  }

  @Get(':id')
  findOne(@Param('id',ParseIntPipe) id: number): Promise<Course|null> {
    return this.courseService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id',ParseIntPipe) id: number, @Body() updateCourseDto: UpdateCourseDto,@Req() req): Promise<Course|null> {
    const user=req.user;
    if(!user||user.usertype=='student'){
      throw new ForbiddenException('Unauthorized');
    }
    return this.courseService.update(id, updateCourseDto);
  }

  @Delete(':id')
  async remove(@Param('id',ParseIntPipe) id: number,@Req() req): Promise<void> {
    const user=req.user;
    if(!user||user.usertype=='student'){
      throw new ForbiddenException('Unauthorized');
    }
    return this.courseService.remove(id);
  }

}