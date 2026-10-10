import { Logger, NotFoundException } from '@nestjs/common';

/**
 * Lop co so cho service CRUD.
 *
 * Cung cap 4 method chinh: `findAll`, `findOne`, `create`, `update`, `remove`.
 */
export abstract class BaseCrudService<
  T,
  C extends Record<string, unknown> = Record<string, unknown>,
  U extends Record<string, unknown> = Record<string, unknown>,
  W extends Record<string, unknown> = Record<string, unknown>,
> {
  protected readonly logger: Logger;

  /**
   * Prisma model accessor.
   * Subclass gan gia tri nay trong constructor:
   * `protected readonly prisma = inject(PrismaService);`
   * `protected get model() { return this.prisma.region; }`
   */
  protected abstract get model(): {
    findMany: (args: { where: W; orderBy: unknown; skip: number; take: number }) => Promise<T[]>;
    findUnique: (args: { where: { id: string } }) => Promise<T | null>;
    findFirst: (args: { where: W }) => Promise<T | null>;
    create: (args: { data: C }) => Promise<T>;
    update: (args: { where: { id: string }; data: U }) => Promise<T>;
    delete: (args: { where: { id: string } }) => Promise<T>;
    count: (args: { where: W }) => Promise<number>;
  };

  protected abstract get modelName(): string;

  protected constructor(modelName: string) {
    this.logger = new Logger(modelName);
  }

  /**
   * Build `where` tu filters + search query.
   * Subclass co the override de them logic rieng (vi du chi tra APPROVED).
   */
  protected buildWhere(params: ListParams): W {
    const where: Record<string, unknown> = { ...(params.filters ?? {}) };
    if (params.q && this.whereSearch) {
      Object.assign(where, this.whereSearch(params.q));
    }
    return where as W;
  }

  /**
   * Ham tim kiem full-text theo `q`. Subclass override neu muon search theo nhieu truong.
   */
  protected whereSearch(_q: string): W | undefined {
    return undefined;
  }

  /**
   * Lay danh sach co phan trang.
   */
  async findAll(params: ListParams): Promise<{ data: T[]; meta: PageMeta }> {
    const where = this.buildWhere(params);
    const orderBy = this.buildOrderBy(params);
    const skip = this.offsetOf(params);
    const take = this.limitOf(params);

    const [total, rows] = await Promise.all([
      this.model.count({ where }),
      this.model.findMany({ where, orderBy, skip, take }),
    ]);

    return {
      data: rows,
      meta: buildPageMeta(total, params),
    };
  }

  /**
   * Lay mot ban ghi theo id. Nem NotFound neu khong co.
   */
  async findOne(id: string): Promise<T> {
    const found = await this.model.findUnique({ where: { id } });
    if (!found) throw new NotFoundException(`${this.modelName} not found`);
    return found;
  }

  /** Tao moi. Subclass override de them logic (validate, tao snapshot...). */
  async create(data: C): Promise<T> {
    return this.model.create({ data });
  }

  /** Cap nhat. Subclass override de them logic. */
  async update(id: string, data: U): Promise<T> {
    await this.findOne(id);
    return this.model.update({ where: { id }, data });
  }

  /** Xoa that. */
  async remove(id: string): Promise<T> {
    await this.findOne(id);
    return this.model.delete({ where: { id } });
  }

  protected limitOf(params: ListParams): number {
    return Math.max(Math.min(params.limit, 100), 1);
  }

  protected offsetOf(params: ListParams): number {
    if (params.offset !== undefined) return params.offset;
    return ((params.page ?? 1) - 1) * this.limitOf(params);
  }

  protected buildOrderBy(_params: ListParams): unknown {
    return undefined;
  }
}

/** Tham so phan trang/sort loc. */
export interface ListParams {
  page: number;
  limit: number;
  q?: string;
  sortBy?: string;
  order: 'asc' | 'desc';
  offset?: number;
  filters?: Record<string, unknown>;
}

interface PageMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

function buildPageMeta(total: number, params: ListParams): PageMeta {
  const limit = params.limit ?? 20;
  const page = params.page ?? 1;
  const totalPages = limit > 0 ? Math.ceil(total / limit) : 0;
  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}
