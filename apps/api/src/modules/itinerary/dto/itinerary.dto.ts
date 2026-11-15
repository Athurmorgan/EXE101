import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { DIETARY_PREFERENCES, TRIP_STYLES, type DietaryPreference, type TripStyle } from '../../ai/dto/ai.dto';

export class CreateItineraryDto {
  @IsUUID()
  regionId!: string;

  @IsString()
  startDate!: string;

  @IsString()
  endDate!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  title?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  travelers?: number;

  /** Ngan sach mot nguoi cho ca chuyen (VND). */
  @IsOptional()
  @IsInt()
  @Min(0)
  budgetVnd?: number;

  @IsOptional()
  @IsArray()
  @IsEnum(TRIP_STYLES, { each: true })
  styles?: TripStyle[];

  @IsOptional()
  @IsEnum(DIETARY_PREFERENCES)
  dietary?: DietaryPreference;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsUUID('all', { each: true })
  preferredPlaceIds?: string[];

  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  startLat?: number;

  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  startLng?: number;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  startLabel?: string;
}

export class ApplyOptionDto {
  @IsInt()
  @Min(1)
  @Max(5)
  optionNumber!: number;
}
