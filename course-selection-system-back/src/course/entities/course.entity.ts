import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Selection } from '../../selection/entities/selection.entity';
@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column('text')
  description: string;

  @Column('text')
  teacher: string;

  @Column('int')
  teacherId: number;

  @OneToMany(() => Selection, selection => selection.course)
  selections: Selection[];
}