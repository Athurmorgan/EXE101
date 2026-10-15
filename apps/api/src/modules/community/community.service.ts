import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AppException, ErrorCode } from '../../common/errors/app.exception';
import { RedisService } from '../../common/services/redis.service';
import { cacheKey } from '../../common/utils/cache-key';
import type { AuthUser } from '../../common/decorators';

@Injectable()
export class CommunityService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async findApproved(query: { page: number; limit: number; regionId?: string; placeId?: string }): Promise<{
    data: unknown[];
    total: number;
    page: number;
    limit: number;
  }> {
    const where: Prisma.PostWhereInput = { status: 'APPROVED' };
    if (query.regionId) where.regionId = query.regionId;
    if (query.placeId) where.placeId = query.placeId;

    return this.redis.getOrSet(
      cacheKey('community:feed', {
        page: query.page,
        limit: query.limit,
        regionId: query.regionId ?? '',
        placeId: query.placeId ?? '',
      }),
      30, // 30s — feed thay doi khi co post moi duyet
      async () => {
        const [total, rows] = await Promise.all([
          this.prisma.post.count({ where }),
          this.prisma.post.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip: (query.page - 1) * query.limit,
            take: query.limit,
            include: {
              author: { select: { id: true, fullName: true, avatarUrl: true } },
              media: { where: { status: 'APPROVED' } },
            },
          }),
        ]);
        return { data: rows, total, page: query.page, limit: query.limit };
      },
    );
  }

  async findOne(id: string, includeAllStatuses = false): Promise<unknown> {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, fullName: true, avatarUrl: true } },
        media: { where: includeAllStatuses ? undefined : { status: 'APPROVED' } },
      },
    });
    if (!post) throw AppException.notFound('Post');
    if (!includeAllStatuses && post.status !== 'APPROVED') throw AppException.notFound('Post');
    return post;
  }

  async create(dto: { title: string; content: string; placeId?: string; regionId?: string; media?: Array<{ type: string; url: string; thumbnail?: string }> }, user: AuthUser): Promise<unknown> {
    const post = await this.prisma.post.create({
      data: {
        title: dto.title,
        content: dto.content,
        authorId: user.id,
        placeId: dto.placeId,
        regionId: dto.regionId,
        status: 'PENDING',
        media: dto.media ? {
          create: dto.media.map((m) => ({
            type: m.type,
            url: m.url,
            thumbnail: m.thumbnail,
            uploadedByName: user.email,
            status: 'PENDING',
          })),
        } : undefined,
      },
      include: { media: true },
    });
    // Post moi tao o PENDING nen chua vao feed → khong can invalidate cache feed.
    return post;
  }

  async remove(id: string, user: AuthUser): Promise<{ id: string }> {
    const post = await this.prisma.post.findUnique({ where: { id } });
    if (!post) throw AppException.notFound('Post');

    if (post.authorId === user.id) {
      await this.prisma.post.delete({ where: { id } });
    } else if (user.role === 'ADMIN') {
      await this.prisma.post.delete({ where: { id } });
    } else if (user.role === 'MANAGER' && post.regionId) {
      const scope = await this.prisma.managerRegion.findFirst({ where: { managerId: user.id, regionId: post.regionId } });
      if (!scope) throw new AppException(ErrorCode.FORBIDDEN, 403, 'Ban khong co quyen xoa post nay');
      await this.prisma.post.delete({ where: { id } });
    } else {
      throw new AppException(ErrorCode.FORBIDDEN, 403, 'Ban khong co quyen xoa post nay');
    }
    // Post APPROVED bi xoa → feed thay doi.
    if (post.status === 'APPROVED') {
      await this.redis.invalidate('community:feed:*');
    }
    return { id };
  }

  /** Goi tu ModerationService khi approve/reject post de lam moi feed cache. */
  async invalidateFeedCache(): Promise<void> {
    await this.redis.invalidate('community:feed:*');
  }

  async findMyPosts(userId: string): Promise<unknown[]> {
    const posts = await this.prisma.post.findMany({
      where: { authorId: userId },
      orderBy: { createdAt: 'desc' },
    });
    return posts;
  }
}
