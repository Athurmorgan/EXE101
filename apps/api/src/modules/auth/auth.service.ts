import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { createHash, randomBytes } from 'node:crypto';
import type { StringValue } from 'ms';
import { DEFAULT_LOCALE, type Locale, type Role } from '@vivivu/shared';
import { PrismaService } from '../../prisma/prisma.service';
import { AppException, ErrorCode } from '../../common/errors/app.exception';
import type { LoginDto } from './dto/login.dto';
import type { RegisterDto } from './dto/register.dto';
import type { ChangePasswordDto, UpdateProfileDto } from './dto/verification.dto';
import type { AuthSessionDto, UserResponseDto } from './dto/auth-response.dto';

/** Claims nhung trong access token. Chi giu toi thieu cho guard va audit. */
export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
}

/**
 * Ban ghi `User` sau khi Google xac thuc.
 *
 * Khai bao rieng thay vi dung `Prisma.UserGetPayload` de controller khong phai
 * import Prisma — va de type nay khớp voi `toResponse` ben duoi.
 */
export interface GoogleUser {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  dateOfBirth: Date | null;
  address: string | null;
  googleId: string | null;
  locale: string;
  role: string;
  status: string;
  authProvider: string;
  emailVerifiedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Token cap moi trong mot lan dang nhap / refresh.
 *
 * `refreshToken` chi dung o controller de gan cookie roi bo di — khong bao gio
 * tra ve trong body vi web dung cookie, mobile tu doc cookie bang thu vien.
 */
export interface IssuedTokens {
  accessToken: string;
  refreshToken: string;
  /** So giay con hieu cua access token. */
  expiresIn: number;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  // -------------------------------------------------------------------------
  // Dang ky
  // -------------------------------------------------------------------------

  /**
   * Tao tai khoan moi. Luon khoi tao voi `role = USER` — nguoi dung tu dang ky
   * khong the tu gan quyen.
   *
   * Tai khoan tao ra o trang thai `PENDING` (chua xac thuc email) nhưng **vẫn
   * đăng nhập được** — theo yêu cầu sản phẩm, xác thực chỉ là bước bắt buộc
   * ở luồng đăng ký, không phải điều kiện để vào web/app.
   *
   * **Khong cap token** o buoc nay: client phai xac thuc email truoc roi moi
   * goi `POST /auth/login` de nhan token. Tra `verificationRequired` de client
   * biet chuyen sang man hinh nhap ma.
   */
  async register(
    dto: RegisterDto,
  ): Promise<{ user: UserResponseDto; verificationRequired: true }> {
    const email = dto.email.trim().toLowerCase();

    // Kiem tra truoc de tra loi ro rang; race condition van duoc chan boi
    // unique constraint (Prisma P2002 -> 409 trong `AllExceptionsFilter`).
    const existing = await this.prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (existing) {
      throw new AppException(
        ErrorCode.EMAIL_ALREADY_EXISTS,
        409,
        'This email is already registered',
      );
    }

    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash: await argon2.hash(dto.password),
        fullName: dto.fullName.trim(),
        dateOfBirth: dto.dateOfBirth ?? null,
        address: dto.address?.trim() ?? null,
        locale: dto.locale ?? DEFAULT_LOCALE,
        role: 'USER',
        // `PENDING` = chua xac thuc email. Khong chan dang nhap.
        status: 'PENDING',
        authProvider: 'LOCAL',
      },
    });

    this.logger.log(`Dang ky tai khoan moi: ${user.email}`);
    return { user: this.toResponse(user), verificationRequired: true };
  }

  // -------------------------------------------------------------------------
  // Dang nhap
  // -------------------------------------------------------------------------

  /**
   * Kiem tra mat khau. Thong bao loi luon chung giua "sai email" va "sai mat khau"
   * de khong lo thong tin tai khoan nao ton tai.
   */
  async login(dto: LoginDto): Promise<{ user: UserResponseDto; tokens: IssuedTokens }> {
    const email = dto.email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user?.passwordHash) {
      throw AppException.unauthorized('Invalid email or password', ErrorCode.INVALID_CREDENTIALS);
    }

    const valid = await argon2.verify(user.passwordHash, dto.password);
    if (!valid) {
      throw AppException.unauthorized('Invalid email or password', ErrorCode.INVALID_CREDENTIALS);
    }

    this.assertCanAuthenticate(user.status);

    this.logger.log(`Dang nhap thanh cong: ${user.email}`);
    const tokens = await this.issueTokens(user.id, user.email, user.role as Role);
    return { user: this.toResponse(user), tokens };
  }

  // -------------------------------------------------------------------------
  // Dang nhap bang Google
  // -------------------------------------------------------------------------

  /**
   * Cap token cho tai khoan vua duoc Google xac thuc.
   *
   * `GoogleAuthService` chi lo phan dinh danh (tao / lien ket tai khoan) — viec
   * cap token nam o day de `JwtService` chi duoc dung o mot noi.
   */
  async loginWithGoogleUser(user: GoogleUser): Promise<{ user: UserResponseDto; tokens: IssuedTokens }> {
    this.assertCanAuthenticate(user.status);
    this.logger.log(`Dang nhap bang Google thanh cong: ${user.email}`);
    const tokens = await this.issueTokens(user.id, user.email, user.role as Role);
    return { user: this.toResponse(user), tokens };
  }

  // -------------------------------------------------------------------------
  // Token
  // -------------------------------------------------------------------------

  /**
   * Cap access token moi (15 phut) + refresh token moi (30 ngay).
   *
   * Refresh token duoc xoay vong moi lan refresh: token cu bi thu hoi ngay,
   * nho phat hien token bi lay di (bat buoc khi client la trinh duyet).
   */
  async issueTokens(userId: string, email: string, role: Role): Promise<IssuedTokens> {
    const accessTtl = this.config.get<string>('JWT_ACCESS_EXPIRES_IN', '15m');
    const refreshTtl = this.config.get<string>('JWT_REFRESH_EXPIRES_IN', '30d');

    const accessToken = await this.jwt.signAsync(
      { sub: userId, email, role } satisfies JwtPayload,
      {
        secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'),
        expiresIn: accessTtl as StringValue,
      },
    );

    // Token ngau nhien chu khong phai JWT: khong can xac thuc, chi can doi chieu
    // bang hash, va co the thu hoi lap tuc.
    const refreshToken = `${randomBytes(48).toString('base64url')}.${Date.now().toString(36)}`;

    await this.prisma.refreshToken.create({
      data: {
        tokenHash: this.hashToken(refreshToken),
        userId,
        expiresAt: new Date(Date.now() + this.durationInSeconds(refreshTtl) * 1000),
      },
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: this.durationInSeconds(accessTtl),
    };
  }

  /** Xac thuc refresh token va cap cap access token moi. */
  async refresh(rawToken: string | undefined): Promise<{ user: UserResponseDto; tokens: IssuedTokens }> {
    const invalid = AppException.unauthorized(
      'Invalid or expired refresh token',
      ErrorCode.TOKEN_EXPIRED,
    );
    if (!rawToken) throw invalid;

    const record = await this.prisma.refreshToken.findUnique({
      where: { tokenHash: this.hashToken(rawToken) },
      include: { user: true },
    });

    // Thong bao chung cho token sai / het han / da thu hoi — khong cho biet
    // token co ton tai hay khong.
    if (!record || record.revokedAt || record.expiresAt < new Date()) throw invalid;

    this.assertCanAuthenticate(record.user.status);

    // Xoay vong: thu hoi token cu ngay sau khi dung.
    await this.prisma.refreshToken.update({
      where: { id: record.id },
      data: { revokedAt: new Date() },
    });

    const tokens = await this.issueTokens(
      record.user.id,
      record.user.email,
      record.user.role as Role,
    );

    return { user: this.toResponse(record.user), tokens };
  }

  /** Thu hoi mot phien dang nhap (token duoc gui trong cookie). */
  async logout(rawToken: string | undefined): Promise<void> {
    if (!rawToken) return;
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash: this.hashToken(rawToken), revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  /** Thu hoi moi phien — dung khi nguoi dung nghi co bi theo doi doi. */
  async logoutAll(userId: string): Promise<number> {
    const { count } = await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    this.logger.log(`Dang xuat khoi moi noi: ${userId} (${count} phien)`);
    return count;
  }

  // -------------------------------------------------------------------------
  // Ho so
  // -------------------------------------------------------------------------

  /** Tra ve ban ghi `User` day du — dung cho noi bo (verify, doi mat khau). */
  async findUserByEmail(email: string): Promise<GoogleUser> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });
    if (!user) throw AppException.notFound('User');
    return user;
  }

  /**
   * Cap nhat ho so ca nhan.
   *
   * Chi nhan `UpdateProfileDto` — khong cho tu gan `role` hay `status`. Nguoi
   * dung doi `role` phai qua Admin (`UsersService`).
   */
  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<UserResponseDto> {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.fullName !== undefined ? { fullName: dto.fullName.trim() } : {}),
        ...(dto.dateOfBirth !== undefined ? { dateOfBirth: dto.dateOfBirth } : {}),
        ...(dto.address !== undefined ? { address: dto.address.trim() || null } : {}),
      },
    });
    return this.toResponse(user);
  }

  /**
   * Doi mat khau. Thoat moi phien — bao dam token cu khong con hieu luc.
   *
   * Client phai dang nhap lai sau khi doi (cookie refresh da bi xoa o
   * controller) — chay lai `login` de cap phien moi.
   */
  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.passwordHash) {
      throw new AppException(
        ErrorCode.INVALID_CREDENTIALS,
        400,
        'This account signs in with Google and has no password to change',
      );
    }

    const valid = await argon2.verify(user.passwordHash, dto.currentPassword);
    if (!valid) {
      throw AppException.unauthorized('Current password is incorrect', ErrorCode.INVALID_CREDENTIALS);
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: await argon2.hash(dto.newPassword) },
    });

    const revoked = await this.logoutAll(userId);
    this.logger.log(`Doi mat khau, thu hoi ${revoked} phien: ${user.email}`);
  }

  // -------------------------------------------------------------------------
  // Tien ich
  // -------------------------------------------------------------------------

  async findById(id: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw AppException.notFound('User');
    return this.toResponse(user);
  }

  /**
   * SHA-256 khong salt. Dung thay vi bcrypt vi refresh token da ngau nhien 64 ky
   * tu, khong can ham bien dau, va quet token cu nhanh hon (dang nhap la
   * duong dan nong).
   */
  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  /** Chuyen "15m" / "30d" / "900" thanh so giay. */
  durationInSeconds(value: string): number {
    const match = /^(\d+)\s*([smhd])?$/.exec(value.trim());
    if (!match) return 900;

    const amount = Number(match[1]);
    const unit = match[2] ?? 's';
    const multiplier: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 };
    return amount * (multiplier[unit] ?? 1);
  }

  /**
   * Chan dang nhap khi tai khoan bi khoa / da xoa.
   *
   * `PENDING` **khong** chan — theo yêu cầu sản phẩm, user chưa xác thực
   * email vẫn vào được web/app; xác thực là bước riêng ở luồng đăng ký.
   * Token đã cấp trước khi khoá vẫn sống tới hết hạn, nên khi khoá phải
   * revoke refresh token kèm (xem `UsersService.suspend`).
   */
  private assertCanAuthenticate(status: string): void {
    if (status === 'SUSPENDED') {
      throw AppException.unauthorized('This account has been suspended', ErrorCode.ACCOUNT_SUSPENDED);
    }
    if (status === 'DELETED') {
      throw AppException.unauthorized('This account has been deleted', ErrorCode.ACCOUNT_DELETED);
    }
  }

  /** Chon dung cac truong tra ra client — khong lo `passwordHash`. */
  private toResponse(user: {
    id: string;
    email: string;
    fullName: string;
    avatarUrl: string | null;
    dateOfBirth: Date | null;
    address: string | null;
    googleId: string | null;
    locale: string;
    role: string;
    status: string;
    authProvider: string;
    emailVerifiedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      avatarUrl: user.avatarUrl,
      dateOfBirth: user.dateOfBirth,
      address: user.address,
      hasGoogleLinked: user.googleId !== null,
      locale: user.locale as Locale,
      role: user.role as Role,
      status: user.status as UserResponseDto['status'],
      authProvider: user.authProvider as UserResponseDto['authProvider'],
      emailVerifiedAt: user.emailVerifiedAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}

/** Khoi tao response chuan cho controller. */
export function toSessionResponse(
  user: UserResponseDto,
  tokens: IssuedTokens,
): AuthSessionDto {
  return { user, accessToken: tokens.accessToken, expiresIn: tokens.expiresIn };
}
