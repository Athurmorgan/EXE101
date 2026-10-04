import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Role } from '@vivivu/shared';
import { ROLES_KEY, type AuthUser } from '../../common/decorators';
import { AppException } from '../errors/app.exception';

/**
 * Chan endpoint theo vai tro: `@Roles('ADMIN')` hoac `@Roles('ADMIN', 'MANAGER')`.
 *
 * Endpoint khong co `@Roles()` thi `RolesGuard` cho qua — phan quyen chi can
 * khai bao khi thuc su co hanh che. Luon dat sau `JwtAuthGuard` de `request.user`
 * da co san.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<Role[] | undefined>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required || required.length === 0) return true;

    const { user } = context.switchToHttp().getRequest<{ user?: AuthUser }>();
    if (!user) throw AppException.unauthorized('Authentication required');

    if (!required.includes(user.role)) {
      throw AppException.forbidden(
        `This action requires one of these roles: ${required.join(', ')}`,
      );
    }

    return true;
  }
}
