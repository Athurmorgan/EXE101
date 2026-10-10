import { Injectable } from '@nestjs/common';
import { AUDIT_ACTIONS } from '@vivivu/shared';
import type { Post, Place } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AppException, ErrorCode } from '../../common/errors/app.exception';
import { AuditService } from '../audit/audit.service';
import type { AuthUser } from '../../common/decorators';

@Injectable()
export class ModerationService {
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditService) {}

  async findPending(type: 'posts' | 'places', user: AuthUser, page = 1, limit = 20): Promise<{ data: unknown[]; total: number }> {
    const allowedRegionIds = await this.getAllowedRegionIds(user);
    if (user.role !== 'ADMIN' && allowedRegionIds.length === 0) return { data: [], total: 0 };

    if (type === 'posts') {
      const where = user.role === 'ADMIN' ? { status: 'PENDING' } : { status: 'PENDING', regionId: { in: allowedRegionIds } };
      const [total, rows] = await Promise.all([
        this.prisma.post.count({ where }),
        this.prisma.post.findMany({ where, orderBy: { createdAt: 'asc' }, skip: (page - 1) * limit, take: limit, include: { author: { select: { id: true, fullName: true, email: true } }, media: true } }),
      ]);
      return { data: rows as unknown[], total };
    }

    const where = user.role === 'ADMIN' ? { status: 'PENDING' } : { status: 'PENDING', regionId: { in: allowedRegionIds } };
    const [total, rows] = await Promise.all([
      this.prisma.place.count({ where }),
      this.prisma.place.findMany({ where, orderBy: { createdAt: 'asc' }, skip: (page - 1) * limit, take: limit, include: { region: true } }),
    ]);
    return { data: rows as unknown[], total };
  }

  async approvePost(postId: string, user: AuthUser): Promise<Post> {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw AppException.notFound('Post');
    await this.assertCanModerate(post.regionId, user, 'approve');

    const updated = await this.prisma.post.update({ where: { id: postId }, data: { status: 'APPROVED' } });
    await this.prisma.postMedia.updateMany({ where: { postId, status: 'PENDING' }, data: { status: 'APPROVED' } });
    await this.audit.record({ action: AUDIT_ACTIONS.POST_APPROVE, targetType: 'Post', targetId: postId, actor: { id: user.id, email: user.email } });
    return updated;
  }

  async rejectPost(postId: string, user: AuthUser, reason?: string): Promise<Post> {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw AppException.notFound('Post');
    await this.assertCanModerate(post.regionId, user, 'reject');

    const updated = await this.prisma.post.update({ where: { id: postId }, data: { status: 'REJECTED' } });
    await this.audit.record({ action: AUDIT_ACTIONS.POST_REJECT, targetType: 'Post', targetId: postId, actor: { id: user.id, email: user.email }, after: { reason } });
    return updated;
  }

  async approvePlace(placeId: string, user: AuthUser): Promise<Place> {
    const place = await this.prisma.place.findUnique({ where: { id: placeId } });
    if (!place) throw AppException.notFound('Place');
    await this.assertCanModerate(place.regionId, user, 'approve');

    const updated = await this.prisma.place.update({ where: { id: placeId }, data: { status: 'APPROVED' } });
    await this.audit.record({ action: AUDIT_ACTIONS.PLACE_APPROVE, targetType: 'Place', targetId: placeId, actor: { id: user.id, email: user.email } });
    return updated;
  }

  async rejectPlace(placeId: string, user: AuthUser, reason?: string): Promise<Place> {
    const place = await this.prisma.place.findUnique({ where: { id: placeId } });
    if (!place) throw AppException.notFound('Place');
    await this.assertCanModerate(place.regionId, user, 'reject');

    const updated = await this.prisma.place.update({ where: { id: placeId }, data: { status: 'REJECTED' } });
    await this.audit.record({ action: AUDIT_ACTIONS.PLACE_REJECT, targetType: 'Place', targetId: placeId, actor: { id: user.id, email: user.email }, after: { reason } });
    return updated;
  }

  private async getAllowedRegionIds(user: AuthUser): Promise<string[]> {
    if (user.role === 'ADMIN') return [];
    if (user.role === 'MANAGER') {
      const scopes = await this.prisma.managerRegion.findMany({ where: { managerId: user.id }, select: { regionId: true } });
      return scopes.map((s) => s.regionId);
    }
    return [];
  }

  private async assertCanModerate(regionId: string | null, user: AuthUser, action: string): Promise<void> {
    if (user.role === 'ADMIN') return;
    if (user.role === 'MANAGER' && regionId) {
      const scope = await this.prisma.managerRegion.findFirst({ where: { managerId: user.id, regionId } });
      if (scope) return;
    }
    throw new AppException(ErrorCode.FORBIDDEN, 403, `Ban khong co quyen ${action} trong khu vuc nay`);
  }
}
