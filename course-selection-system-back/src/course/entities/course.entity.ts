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

  @ManyToOne(() => User, user => user.courses , {
    eager: true,
    onDelete: 'CASCADE'})
  teacherId: User;

  @OneToMany(() => Selection, selection => selection.course)
  selections: Selection[];
}