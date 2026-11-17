import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

export const ROUTE_PROFILES = ['driving', 'walking', 'cycling'] as const;
export type RouteProfile = (typeof ROUTE_PROFILES)[number];

export class GeocodeQueryDto {
  @ApiProperty({ example: 'Hoan Kiem Lake, Hanoi', description: 'Dia chi hoac ten dia diem can tim' })
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  q!: string;

  @ApiPropertyOptional({ example: 5, minimum: 1, maximum: 10, default: 5 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10)
  limit?: number;

  @ApiPropertyOptional({ example: 'vn', description: 'Ma quoc gia ISO 3166-1 alpha-2, mac dinh vn' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  countrycodes?: string;
}

export class ReverseGeocodeQueryDto {
  @ApiProperty({ example: 21.0285, minimum: -90, maximum: 90 })
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat!: number;

  @ApiProperty({ example: 105.8542, minimum: -180, maximum: 180 })
  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  lng!: number;
}

export class RouteWaypointDto {
  @ApiProperty({ example: 21.0285, minimum: -90, maximum: 90 })
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat!: number;

  @ApiProperty({ example: 105.8542, minimum: -180, maximum: 180 })
  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  lng!: number;
}

export class RouteRequestDto {
  @ApiProperty({ type: [RouteWaypointDto], minItems: 2, maxItems: 25 })
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(25)
  @ValidateNested({ each: true })
  @Type(() => RouteWaypointDto)
  waypoints!: RouteWaypointDto[];

  @ApiPropertyOptional({ enum: ROUTE_PROFILES, default: 'driving' })
  @IsOptional()
  @IsIn(ROUTE_PROFILES)
  profile?: RouteProfile;
}

