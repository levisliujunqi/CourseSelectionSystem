import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class UpdateSelectionDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  courseId?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  userId?: string;

  @IsOptional()
  @IsNotEmpty()
  status?: boolean;
}