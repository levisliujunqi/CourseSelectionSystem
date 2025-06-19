import { Controller, Get, Post, Body, Put, Delete, Param, ParseIntPipe, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Post()
  create(@Body() createUserDto: CreateUserDto, @Req() req): Promise<User> {
    const user = req.user;
    if (!user || user.usertype != 'admin' || createUserDto.name == 'admin') {
      throw new Error('Unauthorized');
    }
    return this.userService.create(createUserDto);
  }

  @Get()
  findAll(@Req() req): Promise<User[]> {
    const user = req.user;
    if (!user || user.usertype != 'admin') {
      throw new Error('Unauthorized');
    }
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req): Promise<User | null> {
    const user = req.user;
    if (!user || user.usertype != 'admin' && user.id != id) {
      throw new Error('Unauthorized');
    }
    return this.userService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req
  ): Promise<User | null> {
    const authUser = req.user;
    if (!authUser || (authUser.usertype != 'admin' && authUser.id != id)) {
      throw new Error('Unauthorized');
    }

    const old = await this.userService.findOne(id);
    if (!old) {
      return null;
    }
    if (
      updateUserDto.usertype &&
      updateUserDto.usertype != old.usertype
    ) {

      await this.userService.remove(id);
      const createDto: CreateUserDto = {
        name: updateUserDto.name ?? old.name,
        password: updateUserDto.password ?? old.password,
        usertype: updateUserDto.usertype,
      };
      return this.userService.create(createDto);
    }
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Req() req): Promise<void> {
    const user = req.user;
    if (!user || user.usertype != 'admin') {
      throw new Error('Unauthorized');
    }
    return this.userService.remove(id);
  }

  @Post('login')
  async login(@Req() req) {
    const user = req.user;
    return { id: user.id };
  }

  @Get('search/:name')
  async searchByName(@Param('name') name: string): Promise<User[]> {
    return this.userService.searchByName(name);
  }

  @Get('searchExact/:name')
  async searchByNameExact(@Param('name') name: string): Promise<User|null> {
    return this.userService.searchByNameExact(name);
  }
}