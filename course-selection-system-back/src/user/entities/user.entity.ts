import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Selection } from '../../selection/entities/selection.entity';
@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ unique: true, length: 100 })
  email: string;

  @Column()
  password: string;

  @OneToMany(() => Selection, selection => selection.user)
  selections: Selection[];
}