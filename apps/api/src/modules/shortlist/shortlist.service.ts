import { Injectable } from '@nestjs/common';
import type { Shortlist } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AppException, ErrorCode } from '../../common/errors/app.exception';

@Injectable()
export class ShortlistService {
  constructor(private readonly prisma: PrismaService) {}

  async findByUser(userId: string): Promise<Shortlist[]> {
    return this.prisma.shortlist.findMany({
      where: { userId },
      orderBy: { order: 'asc' },
      include: { place: true },
    }) as unknown as Shortlist[];
  }

  async add(userId: string, dto: { placeId: string; notes?: string; order?: number }): Promise<Shortlist> {
    const place = await this.prisma.place.findUnique({ where: { id: dto.placeId } });
    if (!place) throw AppException.notFound('Place');

    const existing = await this.prisma.shortlist.findUnique({
      where: { userId_placeId: { userId, placeId: dto.placeId } },
    });
    if (existing) return existing;

    let order = dto.order;
    if (order === undefined) {
      const last = await this.prisma.shortlist.findFirst({
        where: { userId },
        orderBy: { order: 'desc' },
      });
      order = last ? last.order + 1 : 0;
    }

    return this.prisma.shortlist.create({
      data: { userId, placeId: dto.placeId, notes: dto.notes, order },
    });
  }

  async update(id: string, userId: string, dto: { notes?: string; order?: number }): Promise<Shortlist> {
    const item = await this.prisma.shortlist.findUnique({ where: { id } });
    if (!item) throw AppException.notFound('Shortlist item');
    if (item.userId !== userId) throw new AppException(ErrorCode.FORBIDDEN, 403, 'You can only edit your own shortlist');
    return this.prisma.shortlist.update({ where: { id }, data: { notes: dto.notes, order: dto.order } });
  }

  async remove(id: string, userId: string): Promise<{ id: string }> {
    const item = await this.prisma.shortlist.findUnique({ where: { id } });
    if (!item) throw AppException.notFound('Shortlist item');
    if (item.userId !== userId) throw new AppException(ErrorCode.FORBIDDEN, 403, 'You can only remove your own shortlist');
    await this.prisma.shortlist.delete({ where: { id } });
    return { id };
  }

  async reorder(userId: string, placeIds: string[]): Promise<Shortlist[]> {
    await Promise.all(placeIds.map((placeId, index) =>
      this.prisma.shortlist.updateMany({ where: { userId, placeId }, data: { order: index } })
    ));
    return this.findByUser(userId);
  }
}
