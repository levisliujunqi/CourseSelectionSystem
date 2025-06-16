import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Course } from '../../course/entities/course.entity';

@Entity('selections')
export class Selection {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User,user => user.selections)
  user: User;

  @ManyToOne(() => Course, course => course.selections)
  course: Course;

  @Column()
  semester: string;

  @Column()
  year: number;
}