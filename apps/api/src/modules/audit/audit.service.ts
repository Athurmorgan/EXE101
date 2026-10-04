import { Injectable, Logger } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { AUDIT_TARGET_TYPES, type AuditAction } from '@vivivu/shared';
import { PrismaService } from '../../prisma/prisma.service';

/** Thong tin nguoi thuc hien, lay tu request hien tai trong controller. */
export interface AuditActor {
  id: string;
  email: string;
  ip?: string | undefined;
  userAgent?: string | undefined;
}

export interface AuditEntry {
  action: AuditAction;
  targetType: string;
  targetId: string;
  actor: AuditActor | null;
  before?: unknown;
  after?: unknown;
}

/**
 * Nhat ky "ai lam gi, luc nao, doi gi".
 *
 * Chi ghi **thay doi**, khong ghi thao tac doc — nhat ky day hon se lon nhanh
 * hon ca bang du lieu chinh. Moi thao tac quan tri deu di qua day de khong the
 * quen ghi.
 *
 * Ghi log **khong nem loi**: mot loi ghi audit khong duoc lam dong `PATCH
 * /admin/users/:id` that bai. Loi nghiem vu da nem response truoc do nen im
 * di o day, chi ghi 1 dong `error` de con biet khi can dieu tra.
 */
@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  async record(entry: AuditEntry): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          actorId: entry.actor?.id ?? null,
          actorEmail: entry.actor?.email ?? null,
          action: entry.action,
          targetType: entry.targetType,
          targetId: entry.targetId,
          // Prisma kiem tra kieu runtime cho cot `Json`: `null` hop le, con
          // `undefined` thi phai gan `null` ro rang truoc khi ghi.
          before: (entry.before ?? null) as Prisma.InputJsonValue,
          after: (entry.after ?? null) as Prisma.InputJsonValue,
          ipAddress: entry.actor?.ip ?? null,
          userAgent: entry.actor?.userAgent?.slice(0, 300) ?? null,
        },
      });
    } catch (error: unknown) {
      this.logger.error(`Ghi audit log that bai (${entry.action}): ${(error as Error).message}`);
    }
  }

  /** Ghi nhan thay doi tren tai khoan — tu lay `targetId` tu `before`/`after`. */
  recordUserChange(
    action: AuditAction,
    actor: AuditActor | null,
    before: unknown,
    after: unknown,
  ): Promise<void> {
    return this.record({
      action,
      targetType: AUDIT_TARGET_TYPES.USER,
      targetId: readId(after) ?? readId(before) ?? 'unknown',
      actor,
      before,
      after,
    });
  }
}

/**
 * Doc `id` tu mot value bat ky.
 *
 * `before` / `after` kieu `unknown` nen phai kiem tra object truoc khi doc —
 * `in` hoan toan an toan voi `null`, array hay primitive.
 */
function readId(value: unknown): string | null {
  if (typeof value !== 'object' || value === null || !('id' in value)) return null;
  // `in` da thu hep kieu thanh `object & Record<'id', unknown>` nen khong con
  // can `as` — assertion o day se bi ESLint bao la thua.
  const { id } = value;
  return typeof id === 'string' ? id : null;
}
