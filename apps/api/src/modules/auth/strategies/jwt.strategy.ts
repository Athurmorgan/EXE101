import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { Role } from '@vivivu/shared';
import { PrismaService } from '../../../prisma/prisma.service';
import type { AuthUser } from '../../../common/decorators';
import type { JwtPayload } from '../auth.service';

/**
 * Doc access token tu header `Authorization: Bearer ...` va gan `request.user`.
 *
 * Token chi chua `sub`/`role` ma van kiem tra lai `status` trong database:
 * admin khoa tai khoan phai co hieu luc ngay, khong cho token cu 15 phut
 * tiep tuc chay.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_ACCESS_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<AuthUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, role: true, status: true },
    });

    if (!user) throw new UnauthorizedException('Account no longer exists');
    if (user.status === 'SUSPENDED') throw new UnauthorizedException('Account has been suspended');

    return { id: user.id, email: user.email, role: user.role as Role };
  }
}
