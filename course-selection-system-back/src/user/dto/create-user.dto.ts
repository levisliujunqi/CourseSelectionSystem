import { IsString, IsOptional} from 'class-validator';

export class CreateUserDto {
  @IsString()
  password: string;

  @IsString()
  name: string;

  @IsString()
  usertype: 'student' | 'teacher' | 'admin';
}