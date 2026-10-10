import { IsBoolean, IsLatitude, IsLongitude, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class CreateRegionDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(120)
  slug!: string;

  @IsLatitude()
  lat!: number;

  @IsLongitude()
  lng!: number;

  @IsOptional()
  @IsBoolean()
  isCity?: boolean;

  @IsOptional()
  @IsUUID()
  parentId?: string;
}

export class UpdateRegionDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  slug?: string;

  @IsOptional()
  @IsLatitude()
  lat?: number;

  @IsOptional()
  @IsLongitude()
  lng?: number;

  @IsOptional()
  @IsBoolean()
  isCity?: boolean;

  @IsOptional()
  @IsUUID()
  parentId?: string;
}
