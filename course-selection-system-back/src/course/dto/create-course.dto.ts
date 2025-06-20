import { IsDateString, IsIn, IsInt, Matches, IsString, Min } from "class-validator";

export class CreateCourseDto {
  name: string;
  description: string;
  @IsInt() @IsIn([1,2,3,4,5,6,7]) dayOfWeek: number
  @Matches(/^[0-2]\d:[0-5]\d$/) startTime: string
  @Matches(/^[0-2]\d:[0-5]\d$/) endTime: string
  @IsDateString() startDate: string
  @IsDateString() endDate: string
  @IsString() location: string
  @IsInt() @Min(1) capacity: number
  @IsInt() teacherId: number;
}