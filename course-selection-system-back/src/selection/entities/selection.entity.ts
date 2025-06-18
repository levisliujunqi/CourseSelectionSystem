import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Course } from '../../course/entities/course.entity';

@Entity('selections')
export class Selection {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User,user => user.selections, { 
    eager: true,
    onDelete: 'CASCADE'})
  user: User;

  @ManyToOne(() => Course, course => course.selections,{
    eager: true,
    onDelete: 'CASCADE'})
  course: Course;
}