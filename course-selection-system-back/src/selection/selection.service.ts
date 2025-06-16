import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Selection } from './entities/selection.entity';
import { CreateSelectionDto } from './dto/create-selection.dto';
import { UpdateSelectionDto } from './dto/update-selection.dto';

@Injectable()
export class SelectionService {
  constructor(
    @InjectRepository(Selection)
    private readonly selectionRepository: Repository<Selection>,
  ) {}

  async create(createSelectionDto: CreateSelectionDto): Promise<Selection|null> {
    const selection = this.selectionRepository.create(createSelectionDto);
    return this.selectionRepository.save(selection);
  }

  async findAll(): Promise<Selection[]> {
    return this.selectionRepository.find();
  }

  async findOne(id: number): Promise<Selection|null> {
    return this.selectionRepository.findOneBy({ id });
  }

  async update(id: number, updateSelectionDto: UpdateSelectionDto): Promise<Selection|null> {
    await this.selectionRepository.update(id, updateSelectionDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.selectionRepository.delete(id);
  }
}