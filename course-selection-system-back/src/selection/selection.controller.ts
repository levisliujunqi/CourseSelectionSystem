import { Controller, Get, Post, Body, Param, Put, Delete, ParseIntPipe } from '@nestjs/common';
import { SelectionService } from './selection.service';
import { CreateSelectionDto } from './dto/create-selection.dto';
import { Selection } from './entities/selection.entity';

@Controller('selections')
export class SelectionController {
  constructor(private readonly selectionService: SelectionService) {}

  @Post()
  create(@Body() createSelectionDto: CreateSelectionDto): Promise<Selection|null> {
    return this.selectionService.create(createSelectionDto);
  }

  @Get()
  findAll(): Promise<Selection[]> {
    return this.selectionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id',ParseIntPipe) id: number): Promise<Selection|null> {
    return this.selectionService.findOne(id);
  }
  
  @Delete(':id')
  remove(@Param('id',ParseIntPipe) id: number): Promise<void> {
    return this.selectionService.remove(id);
  }
}