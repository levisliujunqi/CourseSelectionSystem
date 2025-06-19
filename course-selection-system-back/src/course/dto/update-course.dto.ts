import { IsDateString, IsIn, IsInt, IsOptional, IsString, Matches, Min } from 'class-validator'
export class UpdateCourseDto {
  @IsOptional() @IsString() name?: string
  @IsOptional() @IsString() description?: string

  @IsOptional() @IsInt() @IsIn([1,2,3,4,5,6,7]) dayOfWeek?: number
  @IsOptional() @Matches(/^[0-2]\d:[0-5]\d$/) startTime?: string
  @IsOptional() @Matches(/^[0-2]\d:[0-5]\d$/) endTime?: string
  @IsOptional() @IsDateString() startDate?: string
  @IsOptional() @IsDateString() endDate?: string

  @IsOptional() @IsString() location?: string 
  @IsOptional() @IsInt() @Min(1) capacity?: number

  @IsOptional() @IsInt() teacherId?: number
}