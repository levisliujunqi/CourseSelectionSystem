import { IsNumber, IsOptional, IsString } from 'class-validator';
export class UpdateCourseDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  teacherId?: number;
}