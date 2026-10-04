import { PAGINATION_DEFAULT_LIMIT } from '@vivivu/shared';

/** Thong tin phan trang gui kem moi danh sach. */
export interface PageMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/** Envelope chuan cho moi danh sach, khop voi `PageMeta` o frontend. */
export interface Paginated<T> {
  data: T[];
  meta: PageMeta;
}

export interface PaginateOptions {
  page?: number;
  limit?: number;
  offset?: number;
}

/**
 * Tinh `meta` tu `total` va tham so truy van.
 *
 * `totalPages` la 0 khi khong co ban ghi nao — de FE khong phai xu ly
 * `totalPages / limit` bang 0.
 */
export function buildPageMeta(total: number, options: PaginateOptions = {}): PageMeta {
  const limit = options.limit ?? PAGINATION_DEFAULT_LIMIT;
  const totalPages = limit > 0 ? Math.ceil(total / limit) : 0;

  // offset co the duoc truyen truc tiep (infinite scroll) thay vi page.
  const page =
    options.page ?? (options.offset !== undefined ? Math.floor(options.offset / limit) + 1 : 1);

  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}
