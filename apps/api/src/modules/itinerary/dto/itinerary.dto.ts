import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateItineraryDto {
  @IsString()
  regionId!: string;

  @IsString()
  startDate!: string;

  @IsString()
  endDate!: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  travelers?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  budgetVnd?: number;
}

export class ApplyOptionDto {
  @IsInt()
  @Min(1)
  @Max(5)
  optionNumber!: number;
}
