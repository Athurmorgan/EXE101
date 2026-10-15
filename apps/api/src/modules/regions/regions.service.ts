import { Injectable } from '@nestjs/common';
import type { Prisma, Region } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../common/services/redis.service';
import { cacheKey } from '../../common/utils/cache-key';

@Injectable()
export class RegionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async findAll(params: {
    page?: number;
    limit?: number;
    q?: string;
    sortBy?: string;
    order?: 'asc' | 'desc';
    filters?: { isCity?: boolean };
  }): Promise<{ data: Region[]; total: number; page: number; limit: number }> {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;

    const where: Prisma.RegionWhereInput = {};
    if (params.q) {
      where.OR = [
        { name: { contains: params.q, mode: 'insensitive' } },
        { slug: { contains: params.q, mode: 'insensitive' } },
      ];
    }
    if (params.filters?.isCity !== undefined) {
      where.isCity = params.filters.isCity;
    }

    const orderBy: Prisma.RegionOrderByWithRelationInput =
      params.sortBy === 'name' ? { name: params.order ?? 'asc' } : { name: 'asc' };

    return this.redis.getOrSet(
      cacheKey('regions:list', { page, limit, q: params.q ?? '', sortBy: params.sortBy ?? '', order: params.order ?? '', isCity: params.filters?.isCity }),
      60, // 60s — Region it doi, nhung van cho phep admin cap nhat
      async () => {
        const [total, rows] = await Promise.all([
          this.prisma.region.count({ where }),
          this.prisma.region.findMany({
            where,
            orderBy,
            skip: (page - 1) * limit,
            take: limit,
          }),
        ]);
        return { data: rows, total, page, limit };
      },
    );
  }

  async findOne(id: string): Promise<Region> {
    // findOne co the doc chi tiet mot region (admin thuong update) nen cache ngan.
    return this.redis.getOrSet(
      `regions:item:${id}`,
      300, // 5 phut
      async () => {
        const region = await this.prisma.region.findUnique({ where: { id } });
        if (!region) throw new Error(`Region ${id} not found`);
        return region;
      },
    );
  }

  async create(data: Prisma.RegionCreateInput): Promise<Region> {
    const created = await this.prisma.region.create({ data });
    await this.redis.invalidate('regions:*');
    return created;
  }

  async update(id: string, data: Prisma.RegionUpdateInput): Promise<Region> {
    const updated = await this.prisma.region.update({ where: { id }, data });
    await this.redis.invalidate('regions:*');
    return updated;
  }

  async remove(id: string): Promise<Region> {
    const removed = await this.prisma.region.delete({ where: { id } });
    await this.redis.invalidate('regions:*');
    return removed;
  }

  async findMajorCities(): Promise<Region[]> {
    return this.redis.getOrSet(
      'regions:cities',
      300, // 5 phut — 7 thanh pho lon it khi doi
      async () => {
        return this.prisma.region.findMany({
          where: { isCity: true },
          orderBy: { name: 'asc' },
        });
      },
    );
  }

  async findChildren(parentId: string): Promise<Region[]> {
    return this.redis.getOrSet(
      `regions:children:${parentId}`,
      300, // 5 phut
      async () => {
        return this.prisma.region.findMany({
          where: { parentId },
          orderBy: { name: 'asc' },
        });
      },
    );
  }
}
