import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Selection } from '../../selection/entities/selection.entity';
import { Course } from '../../course/entities/course.entity';
import { Cipher } from 'crypto';
@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique:true,length: 100 })
  name: string;

  @Column({select:false})
  password: string;

  @OneToMany(() => Selection, selection => selection.user)
  selections: Selection[];

  @OneToMany(()=> Course, course => course.teacherId)
  courses: Course[];

  @Column()
  usertype: 'student' | 'teacher' | 'admin';

  @Column()
  college:string;
}