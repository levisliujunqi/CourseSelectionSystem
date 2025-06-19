import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Like, Repository } from 'typeorm';
import { Course } from './entities/course.entity';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
  ) {}

  create(createCourseDto: CreateCourseDto): Promise<Course> {
    const course = this.courseRepository.create({
      name: createCourseDto.name,
      description: createCourseDto.description,
      teacherId: {id:createCourseDto.teacherId},
      dayOfWeek: createCourseDto.dayOfWeek,
      startTime: createCourseDto.startTime,
      endTime: createCourseDto.endTime,
      startDate: createCourseDto.startDate,
      endDate: createCourseDto.endDate,
    });
    return this.courseRepository.save(course);
  }

  findAll(): Promise<Course[]> {
    return this.courseRepository.find();
  }

  findOne(id: number): Promise<Course|null> {
    return this.courseRepository.findOneBy({ id });
  }

  async update(id: number,updateCourseDto: UpdateCourseDto,): Promise<Course|null> {
    const { teacherId, ...rest } = updateCourseDto
    const payload: DeepPartial<Course> = { ...rest }
    if (teacherId !== undefined) {
      payload.teacherId = { id: teacherId } as any
    }
    await this.courseRepository.update(id, payload)
    return this.findOne(id)
  }

  async remove(id: number): Promise<void> {
    await this.courseRepository.delete(id);
  }

  async searchByName(name: string): Promise<Course[]> {
    return this.courseRepository.find({
      where: { name: Like(`%${name}%`) },
    });
  }
}