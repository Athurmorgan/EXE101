import { Injectable } from '@nestjs/common';
import type { Comment } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AppException, ErrorCode } from '../../common/errors/app.exception';
import type { AuthUser } from '../../common/decorators';
import type { CreateCommentDto } from './dto/comment.dto';

@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findByPlace(placeId: string): Promise<Comment[]> {
    return this.prisma.comment.findMany({
      where: { placeId, parentId: null },
      orderBy: { createdAt: 'desc' },
      include: { replies: { orderBy: { createdAt: 'asc' } } },
    }) as unknown as Comment[];
  }

  async findByPost(postId: string): Promise<Comment[]> {
    return this.prisma.comment.findMany({
      where: { postId, parentId: null },
      orderBy: { createdAt: 'desc' },
      include: { replies: { orderBy: { createdAt: 'asc' } } },
    }) as unknown as Comment[];
  }

  async create(dto: CreateCommentDto, user: AuthUser): Promise<Comment> {
    if (!dto.placeId && !dto.postId) {
      throw new AppException(ErrorCode.VALIDATION_FAILED, 400, 'Comment phai lien ket voi place hoac post');
    }

    const userData = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: { fullName: true, avatarUrl: true },
    });

    return this.prisma.comment.create({
      data: {
        content: dto.content,
        authorId: user.id,
        placeId: dto.placeId,
        postId: dto.postId,
        parentId: dto.parentId,
        authorName: userData?.fullName ?? user.email,
        authorAvatar: userData?.avatarUrl ?? null,
      },
    });
  }

  async remove(commentId: string, user: AuthUser): Promise<{ id: string }> {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
      include: { place: true, post: true },
    });
    if (!comment) throw AppException.notFound('Comment');

    if (comment.authorId === user.id) {
      await this.prisma.comment.delete({ where: { id: commentId } });
      return { id: commentId };
    }

    if (user.role === 'ADMIN') {
      await this.prisma.comment.delete({ where: { id: commentId } });
      return { id: commentId };
    }

    if (user.role === 'MANAGER') {
      const regionId = comment.place?.regionId ?? comment.post?.regionId;
      if (regionId) {
        const scope = await this.prisma.managerRegion.findFirst({
          where: { managerId: user.id, regionId },
        });
        if (scope) {
          await this.prisma.comment.delete({ where: { id: commentId } });
          return { id: commentId };
        }
      }
    }

    throw new AppException(ErrorCode.FORBIDDEN, 403, 'Ban khong co quyen xoa comment nay');
  }
}
