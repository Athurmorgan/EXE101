import { IsInt, IsOptional, IsString, IsUUID } from 'class-validator';

export class AddToShortlistDto {
  @IsUUID()
  placeId!: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsInt()
  order?: number;
}

export class UpdateShortlistDto {
  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsInt()
  order?: number;
}
