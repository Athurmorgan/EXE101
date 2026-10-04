import { Injectable, Logger } from '@nestjs/common';
import {
  AUDIT_ACTIONS,
  PAGINATION_DEFAULT_LIMIT,
  PAGINATION_MAX_LIMIT,
  type Role,
} from '@vivivu/shared';
import type { Prisma, User } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AppException, ErrorCode } from '../../common/errors/app.exception';
import { buildPageMeta, type Paginated } from '../../common/dto/paginated.dto';
import type { PageQueryDto } from '../../common/dto/page-query.dto';
import { AuditService, type AuditActor } from '../audit/audit.service';
import type { AdminUserResponseDto, UserActionResultDto } from './dto/admin-user.dto';

/**
 * Quan tri tai khoan — chi `ADMIN` goi duoc (guard o controller).
 *
 * Khong bao gio `delete` that khi khong yeu cau: mac dinh xoa **mem** de
 * giu duong dan tinh cua bai viet va don hang. Xoa han la tuy chon rieng
 * (`hard = true`) va khong cho dung khi tai khoan da tao noi dung.
 */
@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  // -------------------------------------------------------------------------
  // Doc
  // -------------------------------------------------------------------------

  /**
   * Danh sach tai khoan co phan trang + loc.
   *
   * Mac dinh **an** tai khoan da xoa mem. `includeDeleted` bat len se tra ca
   * `DELETED` va `SUSPENDED` — dung cho trang "tai khoan bi xuat" cua admin.
   */
  async findAll(
    query: PageQueryDto,
    filters: { role?: Role; status?: string; includeDeleted?: boolean },
  ): Promise<Paginated<AdminUserResponseDto>> {
    const where = this.buildWhere(filters);

    const [total, rows] = await this.prisma.$transaction([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: this.offsetOf(query),
        take: this.limitOf(query),
      }),
    ]);

    return {
      data: rows.map((row) => this.toResponse(row)),
      meta: buildPageMeta(total, { page: query.page, limit: this.limitOf(query) }),
    };
  }

  /** Chi tiet mot tai khoan, ke ca da xoa mem — admin can xem de khoi phuc. */
  async findOne(id: string): Promise<AdminUserResponseDto> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw AppException.notFound('User');
    return this.toResponse(user);
  }

  // -------------------------------------------------------------------------
  // Khoa / mo khoa
  // -------------------------------------------------------------------------

  /**
   * Khoa tai khoan: `status = SUSPENDED` + thu hoi **toan bo** refresh token.
   *
   * Thu hoi token la bat buoc — access token 15 phut se tu het han, nhung neu
   * chi doi `status` thi refresh van cap token moi va nguoi dung lai vao duoc
   * app. (Xem `PROJECT_STATUS.md` muc 11 — bai "chac tai guard" khong du.)
   */
  async suspend(
    id: string,
    dto: { reason?: string | undefined },
    actor: AuditActor,
  ): Promise<UserActionResultDto> {
    const user = await this.requireUser(id);
    this.assertNotSelf(id, actor, 'You cannot suspend your own account');
    await this.assertNotLastAdmin(user, 'suspend');

    if (user.status === 'SUSPENDED') {
      return { userId: id, status: 'SUSPENDED', revokedSessions: 0 };
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        status: 'SUSPENDED',
        suspendedAt: new Date(),
        suspendedBy: actor.id,
        suspendReason: dto.reason?.trim() || null,
      },
    });

    const revoked = await this.revokeSessions(id);
    await this.audit.recordUserChange(
      AUDIT_ACTIONS.USER_SUSPEND,
      actor,
      this.snapshot(user),
      this.snapshot(updated),
    );

    this.logger.warn(`Khoa tai khoan ${user.email} (${revoked} phien bi thu hoi)`);
    return { userId: id, status: 'SUSPENDED', revokedSessions: revoked };
  }

  /**
   * Mo khoa tai khoan.
   *
   * Xoa `suspendedAt` / `suspendedBy` / `suspendReason` de trang quan tri khong
   * con hien "da khoa" tren tai khoan dang hoat dong. `emailVerifiedAt` giu
   * nguyen — tai khoan da xac thuc mot lan thi khong phai verify lai.
   */
  async unsuspend(id: string, actor: AuditActor): Promise<UserActionResultDto> {
    const user = await this.requireUser(id);

    if (user.status !== 'SUSPENDED') {
      return {
        userId: id,
        status: user.status as UserActionResultDto['status'],
        revokedSessions: 0,
      };
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        status: 'ACTIVE',
        suspendedAt: null,
        suspendedBy: null,
        suspendReason: null,
      },
    });

    await this.audit.recordUserChange(
      AUDIT_ACTIONS.USER_UNSUSPEND,
      actor,
      this.snapshot(user),
      this.snapshot(updated),
    );

    this.logger.log(`Mo khoa tai khoan ${user.email}`);
    return { userId: id, status: 'ACTIVE', revokedSessions: 0 };
  }

  // -------------------------------------------------------------------------
  // Xoa mem / xoa han
  // -------------------------------------------------------------------------

  /**
   * Xoa tai khoan.
   *
   * - `hard = false` (mac dinh): gan `deletedAt` + `status = DELETED`, thu hoi
   *   token. Bai viet / dia diem da tao van con, hien thi theo `authorId`.
   * - `hard = true`: xoa thật — `RefreshToken` va `EmailVerificationToken` bi
   *   `onDelete: Cascade` xoa theo. Dung khi admin can don dep (tai khoan spam
   *   dang ky), khong dung cho tai khoan co du lieu nguoi dung that.
   */
  async remove(
    id: string,
    dto: { hard?: boolean | undefined },
    actor: AuditActor,
  ): Promise<{ userId: string; mode: 'soft' | 'hard' }> {
    const user = await this.requireUser(id);
    this.assertNotSelf(id, actor, 'You cannot delete your own account');
    await this.assertNotLastAdmin(user, 'delete');

    if (dto.hard) {
      await this.prisma.user.delete({ where: { id } });
      await this.audit.recordUserChange(
        AUDIT_ACTIONS.USER_HARD_DELETE,
        actor,
        this.snapshot(user),
        null,
      );
      this.logger.warn(`XOA HAN tai khoan ${user.email}`);
      return { userId: id, mode: 'hard' };
    }

    if (user.deletedAt) {
      return { userId: id, mode: 'soft' };
    }

    await this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'DELETED' },
    });
    const revoked = await this.revokeSessions(id);

    await this.audit.recordUserChange(
      AUDIT_ACTIONS.USER_DELETE,
      actor,
      this.snapshot(user),
      this.snapshot(await this.prisma.user.findUnique({ where: { id } })),
    );

    this.logger.warn(`Xoa mem tai khoan ${user.email} (${revoked} phien bi thu hoi)`);
    return { userId: id, mode: 'soft' };
  }

  /** Khoi phuc tai khoan da xoa mem. KHONG khoi phuc duoc tai khoan xoa han. */
  async restore(id: string, actor: AuditActor): Promise<UserActionResultDto> {
    const user = await this.requireUser(id);
    if (!user.deletedAt) {
      return {
        userId: id,
        status: user.status as UserActionResultDto['status'],
        revokedSessions: 0,
      };
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: { deletedAt: null, status: 'ACTIVE', suspendedAt: null, suspendReason: null },
    });

    await this.audit.recordUserChange(
      AUDIT_ACTIONS.USER_RESTORE,
      actor,
      this.snapshot(user),
      this.snapshot(updated),
    );

    this.logger.log(`Khoi phuc tai khoan ${user.email}`);
    return { userId: id, status: 'ACTIVE', revokedSessions: 0 };
  }

  // -------------------------------------------------------------------------
  // Vai tro
  // -------------------------------------------------------------------------

  /**
   * Doi vai tro. `MANAGER` dung de duyet noi dung trong khu vuc duoc gan.
   *
   * Khong cho doi vai tro cua chinh minh — admin ha cap `ADMIN` cua minh xuong
   * `USER` se khoa chinh he thong. Muon giu quyen thi tao tai khoan ADMIN moi.
   */
  async updateRole(
    id: string,
    role: Role,
    actor: AuditActor,
  ): Promise<AdminUserResponseDto> {
    const user = await this.requireUser(id);
    this.assertNotSelf(id, actor, 'You cannot change your own role');
    await this.assertNotLastAdmin(user, 'change role of');

    if (user.role === role) return this.toResponse(user);

    const updated = await this.prisma.user.update({ where: { id }, data: { role } });

    await this.audit.recordUserChange(
      AUDIT_ACTIONS.USER_UPDATE_ROLE,
      actor,
      this.snapshot(user),
      this.snapshot(updated),
    );

    // Role cu trong access token 15 phut — thu hoi refresh de lan refresh
    // tiep lay role moi, tranh admin doi quyen nhung token cu van con hieu luc.
    await this.revokeSessions(id);

    this.logger.log(`Doi vai tro ${user.email}: ${user.role} -> ${role}`);
    return this.toResponse(updated);
  }

  // -------------------------------------------------------------------------
  // Phien dang nhap
  // -------------------------------------------------------------------------

  /**
   * Thuat moi phien cua mot tai khoan ma khong doi trang thai.
   *
   * Dung khi nguoi dung nghi bi theo doi doi — dang nhap lai binh thuong, chi
   * thu hoi token dang co.
   */
  async forceLogout(id: string, actor: AuditActor): Promise<{ userId: string; revokedSessions: number }> {
    const user = await this.requireUser(id);
    const revoked = await this.revokeSessions(id);

    await this.audit.recordUserChange(AUDIT_ACTIONS.USER_FORCE_LOGOUT, actor, this.snapshot(user), null);
    return { userId: id, revokedSessions: revoked };
  }

  // -------------------------------------------------------------------------
  // Tien ich
  // -------------------------------------------------------------------------

  /**
   * Truy van theo id, bao gom ca tai khoan da xoa mem.
   *
   * Quan tri phai nhin thay tai khoan da xoa de **khoi phuc** duoc — findUnique
   * co dieu kien `deletedAt = null` se lam `restore` khong chay duoc.
   */
  private async requireUser(id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw AppException.notFound('User');
    return user;
  }

  private buildWhere(filters: {
    role?: Role;
    status?: string;
    includeDeleted?: boolean;
  }): Prisma.UserWhereInput {
    const where: Prisma.UserWhereInput = {};

    if (filters.includeDeleted) {
      // Admin xem "tai khoan bi xuat" — giu ca `DELETED` va `SUSPENDED`.
      if (filters.status) where.status = filters.status;
    } else {
      where.deletedAt = null;
      if (filters.status) where.status = filters.status;
    }

    if (filters.role) where.role = filters.role;
    return where;
  }

  private limitOf(query: PageQueryDto): number {
    return Math.min(Math.max(query.limit ?? PAGINATION_DEFAULT_LIMIT, 1), PAGINATION_MAX_LIMIT);
  }

  /** `offset` explicit duoc uu tien — frontend phan trang tu thoi gian. */
  private offsetOf(query: PageQueryDto): number {
    if (query.offset !== undefined) return query.offset;
    return ((query.page ?? 1) - 1) * this.limitOf(query);
  }

  /** Thu hoi **moi** refresh token con hieu luc. */
  private async revokeSessions(userId: string): Promise<number> {
    const { count } = await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    return count;
  }

  /**
   * Thay cho thong tin con dung cho `before` / `after` trong audit log.
   *
   * Chon **tay** tung truong de khong bao gio ghi `passwordHash` vao nhat ky —
   * du database co bi lay thi nhat ky khong lo thong tin dang hoat dong cua mat
   * khau (hash argon2 rat kho dung lai nhung van la du lieu nhay cam).
   */
  private snapshot(user: User | null): Record<string, unknown> | null {
    if (!user) return null;
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      status: user.status,
      authProvider: user.authProvider,
      emailVerifiedAt: user.emailVerifiedAt,
      deletedAt: user.deletedAt,
      suspendedAt: user.suspendedAt,
      suspendReason: user.suspendReason,
      googleId: user.googleId,
    };
  }

  private assertNotSelf(id: string, actor: AuditActor, message: string): void {
    if (actor.id === id) {
      throw new AppException(ErrorCode.CANNOT_MODIFY_SELF, 400, message);
    }
  }

  /**
   * Chan "khoa/xoa doi voi tai khoan ADMIN cuoi cung".
   *
   * `Promise.all` lay 2 so dem — `count` cua Prisma chi tra khi het dong nen
   * phai chay song song.
   */
  private async assertNotLastAdmin(user: User, action: string): Promise<void> {
    if (user.role !== 'ADMIN' || user.deletedAt) return;

    const [admins, otherAdmins] = await Promise.all([
      this.prisma.user.count({ where: { role: 'ADMIN', deletedAt: null } }),
      this.prisma.user.count({ where: { role: 'ADMIN', deletedAt: null, id: { not: user.id } } }),
    ]);

    if (admins > 0 && otherAdmins === 0) {
      throw new AppException(
        ErrorCode.CANNOT_MODIFY_LAST_ADMIN,
        400,
        `This is the only ADMIN account — you cannot ${action} it. Promote another account to ADMIN first.`,
      );
    }
  }

  private toResponse(user: User): AdminUserResponseDto {
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      avatarUrl: user.avatarUrl,
      dateOfBirth: user.dateOfBirth,
      address: user.address,
      hasGoogleLinked: user.googleId !== null,
      locale: user.locale,
      role: user.role as Role,
      status: user.status as UserActionResultDto['status'],
      authProvider: user.authProvider,
      emailVerifiedAt: user.emailVerifiedAt,
      deletedAt: user.deletedAt,
      suspendedAt: user.suspendedAt,
      suspendReason: user.suspendReason,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
