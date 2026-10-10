import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsLatitude,
  IsLongitude,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export const PLACE_CATEGORIES = [
  'restaurant',
  'cafe',
  'attraction',
  'hotel',
  'shopping',
] as const;
export type PlaceCategory = (typeof PLACE_CATEGORIES)[number];

export const CUISINE_TYPES = [
  'vietnamese',
  'bbq',
  'seafood',
  'vegetarian',
  'international',
  'dessert',
  'street-food',
] as const;
export type CuisineType = (typeof CUISINE_TYPES)[number];

export const MEAL_TYPES = [
  'breakfast',
  'lunch',
  'dinner',
  'coffee',
  'all-day',
] as const;
export type MealType = (typeof MEAL_TYPES)[number];

export const PRICE_RANGES = ['budget', 'moderate', 'high-end'] as const;
export type PriceRange = (typeof PRICE_RANGES)[number];

/** Body tao moi Place. */
export class CreatePlaceDto {
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsLatitude()
  lat!: number;

  @IsLongitude()
  lng!: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;

  @IsEnum(PLACE_CATEGORIES, { message: `category phai la mot trong: ${PLACE_CATEGORIES.join(', ')}` })
  category!: PlaceCategory;

  // === FOOD FIELDS (optional, chi ap dung neu category = restaurant/cafe) ===
  @IsOptional()
  @IsEnum(CUISINE_TYPES)
  cuisineType?: CuisineType;

  @IsOptional()
  @IsEnum(MEAL_TYPES)
  mealType?: MealType;

  @IsOptional()
  @IsEnum(PRICE_RANGES)
  priceRange?: PriceRange;

  @IsOptional()
  @IsInt()
  @Min(0)
  avgMealPrice?: number;

  @IsOptional()
  @IsUUID()
  regionId?: string;

  @IsOptional()
  @IsBoolean()
  isHiddenPlace?: boolean;
}

/** Body cap nhat Place. */
export class UpdatePlaceDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsLatitude()
  lat?: number;

  @IsOptional()
  @IsLongitude()
  lng?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;

  @IsOptional()
  @IsEnum(PLACE_CATEGORIES)
  category?: PlaceCategory;

  @IsOptional()
  @IsEnum(CUISINE_TYPES)
  cuisineType?: CuisineType;

  @IsOptional()
  @IsEnum(MEAL_TYPES)
  mealType?: MealType;

  @IsOptional()
  @IsEnum(PRICE_RANGES)
  priceRange?: PriceRange;

  @IsOptional()
  @IsInt()
  @Min(0)
  avgMealPrice?: number;

  @IsOptional()
  @IsUUID()
  regionId?: string;

  @IsOptional()
  @IsBoolean()
  isHiddenPlace?: boolean;
}

/** Query search place voi nhieu filter. */
export class SearchPlaceDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsEnum(PLACE_CATEGORIES)
  category?: PlaceCategory;

  @IsOptional()
  @IsUUID()
  regionId?: string;

  @IsOptional()
  @IsEnum(CUISINE_TYPES)
  cuisineType?: CuisineType;

  @IsOptional()
  @IsEnum(MEAL_TYPES)
  mealType?: MealType;

  @IsOptional()
  @IsEnum(PRICE_RANGES)
  priceRange?: PriceRange;

  @IsOptional()
  @IsBoolean()
  isHiddenPlace?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat?: number;

  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  lng?: number;

  /** Ban kinh tim kiem (km), mac dinh 10km. */
  @IsOptional()
  @IsNumber()
  @Min(0.1)
  @Max(100)
  radiusKm?: number;

  @IsOptional()
  page: number = 1;

  @IsOptional()
  limit: number = 20;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsEnum({ asc: 'asc', desc: 'desc' })
  order: 'asc' | 'desc' = 'desc';
}
