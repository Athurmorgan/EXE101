import { SetMetadata, createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { Role } from '@vivivu/shared';

export const ROLES_KEY = 'vivivu:roles';
export const IS_PUBLIC_KEY = 'vivivu:public';

/** Danh sach role duoc phep goi endpoint. Kiem tra boi `RolesGuard`. */
export const Roles = (...roles: Role[]): ReturnType<typeof SetMetadata> => SetMetadata(ROLES_KEY, roles);

/**
 * Danh dau endpoint cong khai — `JwtAuthGuard` se bo qua viec kiem tra token.
 *
 * Chi dung cho route doc thong tin (xem dia diem, bai viet da duyet). Moi
 * thao tac thay doi du lieu deu phai co token.
 */
export const Public = (): ReturnType<typeof SetMetadata> => SetMetadata(IS_PUBLIC_KEY, true);

/** Phien dang nhap lay tu request, do `JwtStrategy` gan vao. */
export interface AuthUser {
  id: string;
  email: string;
  role: Role;
}

/**
 * `@CurrentUser()` — dung khi can thong tin nguoi goi, vi du `@CurrentUser('id')`.
 *
 * Tra null thay vi nem loi de handler tu quyet dinh phai 401 hay khong;
 * `JwtAuthGuard` da bao dam endpoint la protected.
 */
export const CurrentUser = createParamDecorator(
  (field: keyof AuthUser | undefined, context: ExecutionContext): AuthUser | AuthUser[keyof AuthUser] | null => {
    const request = context.switchToHttp().getRequest<{ user?: AuthUser }>();
    const user = request.user;
    if (!user) return null;
    return field ? user[field] : user;
  },
);
