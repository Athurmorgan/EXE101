import { Injectable } from '@nestjs/common';
import type { Prisma, Region } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RegionsService {
  constructor(private readonly prisma: PrismaService) {}

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

    const [total, rows] = await Promise.all([
      this.prisma.region.count({ where }),
      this.prisma.region.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return { data: rows as Region[], total, page, limit };
  }

  async findOne(id: string): Promise<Region> {
    const region = await this.prisma.region.findUnique({ where: { id } });
    if (!region) throw new Error(`Region ${id} not found`);
    return region as Region;
  }

  async create(data: Prisma.RegionCreateInput): Promise<Region> {
    return this.prisma.region.create({ data }) as unknown as Region;
  }

  async update(id: string, data: Prisma.RegionUpdateInput): Promise<Region> {
    return this.prisma.region.update({ where: { id }, data }) as unknown as Region;
  }

  async remove(id: string): Promise<Region> {
    return this.prisma.region.delete({ where: { id } }) as unknown as Region;
  }

  async findMajorCities(): Promise<Region[]> {
    return this.prisma.region.findMany({
      where: { isCity: true },
      orderBy: { name: 'asc' },
    }) as unknown as Region[];
  }

  async findChildren(parentId: string): Promise<Region[]> {
    return this.prisma.region.findMany({
      where: { parentId },
      orderBy: { name: 'asc' },
    }) as unknown as Region[];
  }
}
