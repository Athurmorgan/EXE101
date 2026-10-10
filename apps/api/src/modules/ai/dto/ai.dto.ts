import { IsArray, IsEnum, IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

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

  /** Dia diem user da them vao shortlist (uu tien giu lai). */
  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  preferredPlaceIds?: string[];

  /** Gio bat dau moi ngay (mac dinh 9h). */
  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(15)
  startHour?: number;
}
