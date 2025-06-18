import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Selection } from './entities/selection.entity';
import { CreateSelectionDto } from './dto/create-selection.dto';
import { Course } from 'src/course/entities/course.entity';
import { User } from 'src/user/entities/user.entity';
@Injectable()
export class SelectionService {
  constructor(
    @InjectRepository(Selection)
    private readonly selectionRepository: Repository<Selection>,
  ) {}

  async create(createSelectionDto: CreateSelectionDto): Promise<Selection|null> {
    const selection = this.selectionRepository.create({
      user:{id:createSelectionDto.userId} as User,
      course:{id:createSelectionDto.courseId} as Course,
    }
    );
    return this.selectionRepository.save(selection);
  }

  async findAll(): Promise<Selection[]> {
    return this.selectionRepository.find();
  }

  async findOne(id: number): Promise<Selection|null> {
    return this.selectionRepository.findOneBy({ id });
  }

  async remove(id: number): Promise<void> {
    await this.selectionRepository.delete(id);
  }

  async findByStudent(userId: number): Promise<Selection[]> {
    return this.selectionRepository.find({
      where: { user: { id: userId } },
      relations: ['course', 'user'],
    });
  }

  async findByCourse(courseId: number): Promise<Selection[]> {
    return this.selectionRepository.find({
      where: { course: { id: courseId } },
      relations: ['course', 'user'],
    });
  }
}