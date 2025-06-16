import { IsString, IsOptional, IsEmail } from 'class-validator';

export class CreateUserDto {
  @IsString()
  password: string;

  @IsEmail()
  email: string;

  @IsString()
  name: string;

  @IsString()
  usertype: 'student' | 'teacher' | 'admin';
}