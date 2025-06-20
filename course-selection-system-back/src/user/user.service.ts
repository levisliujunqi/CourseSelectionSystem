import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { error } from 'console';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create(createUserDto);
    return this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(id: number): Promise<User|null> {
    return this.userRepository.findOneBy({ id });
  }
  async findOne1(id: number): Promise<User|null> {
    return this.userRepository.findOne({
      where: { id },
      select: ['id', 'name', 'password','selections', 'courses','usertype', 'college'],
    });
  }
  async update(id: number, updateUserDto: UpdateUserDto): Promise<User|null> {
    await this.userRepository.update(id, updateUserDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }

  async findByName(name: string): Promise<User|null> {
    return this.userRepository.findOne({
      where: { name },
      select: ['id', 'name', 'usertype', 'password'],
    });
  }
  
  async searchByName(name: string): Promise<User[]> {
      return this.userRepository.find({
        where: { name: Like(`%${name}%`) },
      });
    }

  async searchByNameExact(name: string): Promise<User> {
      const user=await this.userRepository.findOneBy({name});
      if(!user){
        throw new Error("user not found")
      }
      return user;
    }
}