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
    @InjectRepository(Course)
    private readonly courseRepo: Repository<Course>,
  ) { }

  async create(createSelectionDto: CreateSelectionDto): Promise<Selection | null> {
    const course = await this.courseRepo.findOne({ where: { id: createSelectionDto.courseId } })
    if (!course) throw new Error('课程不存在')
    if (course.selectedCount >= course.capacity) {
      throw new Error('选课失败：课程人数已达上限');
    }
    const existing = await this.selectionRepository.find({
      where: { user: { id: createSelectionDto.userId } },
      relations: ['course'],
    })

    for (const sel of existing) {
      const c = sel.course
      if (!(course.endDate < c.startDate || course.startDate > c.endDate)) {
        if (course.dayOfWeek === c.dayOfWeek) {
          if (!(course.endTime <= c.startTime || course.startTime >= c.endTime)) {
            throw new Error('选课失败：时间冲突')
          }
        }
      }
    }

    const entity = this.selectionRepository.create({
      user: { id: createSelectionDto.userId } as any,
      course: { id: createSelectionDto.courseId } as any,
    })
    const saved = await this.selectionRepository.save(entity)
    await this.courseRepo.increment({ id: createSelectionDto.courseId }, 'selectedCount', 1)
    return saved
  }

  async findAll(): Promise<Selection[]> {
    return this.selectionRepository.find();
  }

  async findOne(id: number): Promise<Selection | null> {
    return this.selectionRepository.findOneBy({ id });
  }

  async remove(id: number): Promise<void> {
    const sel = await this.selectionRepository.findOne({
      where: { id },
      relations: ['course']
    })
    if (!sel) return

    await this.selectionRepository.delete(id)
    await this.courseRepo.decrement({ id: sel.course.id }, 'selectedCount', 1)
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