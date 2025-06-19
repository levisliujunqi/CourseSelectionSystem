import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne } from 'typeorm';
import { Selection } from '../../selection/entities/selection.entity';
import { User } from 'src/user/entities/user.entity';
@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column('text')
  description: string;

  @Column('int')//1(周一) ~7(周日)
  dayOfWeek: number;

  @Column({ length: 5 })//HH:mm
  startTime: string;

  @Column({ length: 5 })
  endTime: string;

  @Column('date')//yyyy-MM-dd
  startDate: string;

  @Column('date')
  endDate: string;

  @Column({ length: 200 })
  location: string;

  @Column('int')
  capacity: number;

  @ManyToOne(() => User, user => user.courses, {
    eager: true,
    onDelete: 'CASCADE'
  })
  teacherId: User;

  @OneToMany(() => Selection, selection => selection.course)
  selections: Selection[];

  @Column('int', { default: 0 })
  selectedCount: number;
}