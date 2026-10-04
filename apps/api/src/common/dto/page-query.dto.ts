import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { PAGINATION_DEFAULT_LIMIT, PAGINATION_MAX_LIMIT } from '@vivivu/shared';

/**
 * Query phan trang chuan cho moi resource.
 *
 * Moi controller muon ho tro `?page=&limit=` ke thua class nay — tranh tinh
 * lai `ParseIntPipe` o tung endpoint.
 */
export class PageQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(PAGINATION_MAX_LIMIT)
  limit: number = PAGINATION_DEFAULT_LIMIT;

  /** Tu khoa tim kiem. Module tu quyet dinh ap dung vao truong nao. */
  @IsOptional()
  @IsString()
  q?: string;

  /** Ten truong sap xep. Module kiem tra hop le truoc khi truyền xuong Prisma. */
  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsEnum({ asc: 'asc', desc: 'desc' })
  order: 'asc' | 'desc' = 'desc';

  /** So phan tu bo qua — dung cho `infinite scroll` tren FE. */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number;
}
