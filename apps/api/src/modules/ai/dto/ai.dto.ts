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

export const TRIP_STYLES = [
  'adventure',
  'relaxation',
  'cultural',
  'foodie',
  'family',
  'budget',
  'luxury',
] as const;
export type TripStyle = (typeof TRIP_STYLES)[number];

export const DIETARY_PREFERENCES = [
  'none',
  'vegetarian',
  'vegan',
  'halal',
  'gluten-free',
] as const;
export type DietaryPreference = (typeof DIETARY_PREFERENCES)[number];

/** Request sinh 5 itinerary options. */
export class GenerateItineraryDto {
  @IsUUID()
  regionId!: string;

  @IsString()
  startDate!: string;

  @IsString()
  endDate!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  travelers?: number;

  /** Ngan sach MOT NGUOI cho ca chuyen (VND). */
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

  /** Dia diem bat buoc co trong lich (user chon tu shortlist). */
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsUUID('all', { each: true })
  preferredPlaceIds?: string[];

  /** Diem xuat phat moi ngay: khach san hoac vi tri hien tai. Bo trong = trung tam vung. */
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

  /** Gio bat dau moi ngay (mac dinh 8h). */
  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(15)
  startHour?: number;
}
