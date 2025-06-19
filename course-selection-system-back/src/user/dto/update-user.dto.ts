import { IsString, IsOptional, isString} from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  readonly name?: string;

  @IsOptional()
  @IsString()
  readonly password?: string;

  @IsOptional()
  @IsString()
  readonly usertype?: 'student' | 'teacher' | 'admin';

  @IsOptional()
  @IsString()
  readonly college?: string;
}