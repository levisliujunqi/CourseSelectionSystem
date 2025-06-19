import { Controller, Get, Post, Body, Param, Put, Delete, ParseIntPipe, Req} from '@nestjs/common';
import { SelectionService } from './selection.service';
import { CreateSelectionDto } from './dto/create-selection.dto';
import { Selection } from './entities/selection.entity';

@Controller('selections')
export class SelectionController {
  constructor(private readonly selectionService: SelectionService) {}

  @Post()
  create(@Body() createSelectionDto: CreateSelectionDto,@Req() req): Promise<Selection|null> {
    const user=req.user;
    if(!user||user.usertype!='student'){
      throw new Error('Unauthorized');
    }
    return this.selectionService.create(createSelectionDto);
  }

  @Get()
  findAll(@Req() req): Promise<Selection[]> {
    const user=req.user;
    if(!user||user.usertype=='student'){
      throw new Error('Unauthorized');
    }
    return this.selectionService.findAll();
  }
  @Get('course/:courseId')
  async findByCourse(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Req() req
  ): Promise<Selection[]> {
    const user = req.user;
    if (!user||user.usertype=='student') throw new Error('Unauthorized');
    return this.selectionService.findByCourse(courseId);
  }
  @Get('my')
  async findMy(@Req() req): Promise<Selection[]> {
    const user = req.user;
    if (!user || user.usertype != 'student') {
      throw new Error('Unauthorized');
    }
    return this.selectionService.findByStudent(user.id);
  }
  @Get(':id')
  async findOne(@Param('id',ParseIntPipe) id: number,@Req() req): Promise<Selection|null> {
    const user = req.user;
    const result: Selection|null = await this.selectionService.findOne(id);
    if (!user || (user.usertype !== 'admin' && user.id !== result?.user.id &&user.id!== result?.course.teacherId.id)) {
      throw new Error('Unauthorized');
    }
    return result;
  }
  
  @Delete(':id')
  async remove(@Param('id',ParseIntPipe) id: number,@Req() req): Promise<void> {
    const user=req.user;
    const result: Selection|null = await this.selectionService.findOne(id);
    console.log(result?.course.teacherId);
    if (!user || (user.usertype !== 'admin' && user.id !== result?.user.id&&user.id!== result?.course.teacherId.id)) {
      throw new Error('Unauthorized');
    }
    return this.selectionService.remove(id);
  }
}