import { Injectable } from '@nestjs/common';
import type { Reaction } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AppException, ErrorCode } from '../../common/errors/app.exception';
import type { AuthUser } from '../../common/decorators';
import type { CreateReactionDto } from './dto/reaction.dto';

@Injectable()
export class ReactionsService {
  constructor(private readonly prisma: PrismaService) {}

  async countByPlace(placeId: string): Promise<Record<string, number>> {
    const rows = await this.prisma.reaction.groupBy({
      by: ['type'],
      where: { placeId },
      _count: true,
    });
    const result: Record<string, number> = {};
    for (const r of rows) {
      result[r.type] = r._count;
    }
    return result;
  }

  async upsert(dto: CreateReactionDto, user: AuthUser): Promise<Reaction> {
    if (!dto.placeId && !dto.postId) {
      throw new AppException(ErrorCode.VALIDATION_FAILED, 400, 'Reaction phai lien ket voi place hoac post');
    }

    const userData = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: { fullName: true },
    });

    if (dto.placeId) {
      return this.prisma.reaction.upsert({
        where: { userId_placeId: { userId: user.id, placeId: dto.placeId } },
        create: { type: dto.type, userId: user.id, placeId: dto.placeId, userName: userData?.fullName ?? user.email },
        update: { type: dto.type },
      });
    }

    return this.prisma.reaction.upsert({
      where: { userId_postId: { userId: user.id, postId: dto.postId! } },
      create: { type: dto.type, userId: user.id, postId: dto.postId, userName: userData?.fullName ?? user.email },
      update: { type: dto.type },
    });
  }

  async remove(reactionId: string, user: AuthUser): Promise<{ id: string }> {
    const r = await this.prisma.reaction.findUnique({ where: { id: reactionId } });
    if (!r) throw AppException.notFound('Reaction');
    if (r.userId !== user.id && user.role !== 'ADMIN') {
      throw new AppException(ErrorCode.FORBIDDEN, 403, 'You can only remove your own reaction');
    }
    await this.prisma.reaction.delete({ where: { id: reactionId } });
    return { id: reactionId };
  }
}
