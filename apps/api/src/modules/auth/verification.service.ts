import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, randomInt } from 'node:crypto';
import {
  EMAIL_VERIFICATION_CODE_LENGTH,
  EMAIL_VERIFICATION_TTL_SECONDS,
  type AuthProvider,
  type Locale,
  type Role,
  type UserStatus,
} from '@vivivu/shared';
import { PrismaService } from '../../prisma/prisma.service';
import { AppException, ErrorCode } from '../../common/errors/app.exception';
import type { UserResponseDto } from './dto/auth-response.dto';

/**
 * Gui email.
 *
 * M1 khong co mail server — chi **in ma ra console** de test. Khi len
 * production chi thay `sendVerificationCode` (mot ham), khong doi API: sinh ma,
 * tao token va luu hash deu nam o `VerificationService`.
 *
 * Muon bat dau that: tao `SmtpMailService` cung interface va doi provider
 * trong `AuthModule` — controller va service khong doi mot dong nao.
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly config: ConfigService) {}

  /**
   * Gui email chua ma xac thuc. Tra ve chinh ma de controller tra lai cho
   * client **chi khi dang dev** — giup kiem thu nhanh khong can doc log server.
   */
  async sendVerificationCode(email: string, code: string): Promise<void> {
    const minutes = Math.round(EMAIL_VERIFICATION_TTL_SECONDS / 60);
    const frontendUrl = this.config.get<string>('FRONTEND_URL', 'http://localhost:5173');
    const link = `${frontendUrl}/verify-email?email=${encodeURIComponent(email)}&code=${code}`;

    this.logger.warn(
      [
        '',
        '='.repeat(78),
        '  MA XAC THUC EMAIL (chua cau hinh mail that — in ra console)',
        `  Email : ${email}`,
        `  Ma    : ${code}`,
        `  Link  : ${link}`,
        `  Hạn   : ${minutes} phút`,
        '='.repeat(78),
        '',
      ].join('\n'),
    );
  }
}

@Injectable()
export class VerificationService {
  private readonly logger = new Logger(VerificationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
    private readonly config: ConfigService,
  ) {}

  /**
   * Sinh ma 6 chu so roi luu hash. Ma cu duoc sinh lai moi lan gui — token cu
   * khong con dung duoc ngay khi co ma moi (truong hop nguoi dung da verify
   * sau do van dung lai link cu).
   */
  async issueCode(userId: string, email: string): Promise<string> {
    // Xoa het token chua dung truoc khi tao moi — tranh ton tai nhieu ma cung
    // hieu luc, khi do ma moi den ma khong bi tu choi.
    await this.prisma.emailVerificationToken.deleteMany({
      where: { userId, consumedAt: null },
    });

    // `randomInt` dung CSPRNG — `Math.random` de doan ra duoc ma 6 chu so.
    const code = randomInt(0, 10 ** EMAIL_VERIFICATION_CODE_LENGTH)
      .toString()
      .padStart(EMAIL_VERIFICATION_CODE_LENGTH, '0');

    await this.prisma.emailVerificationToken.create({
      data: {
        tokenHash: this.hashCode(code),
        userId,
        expiresAt: new Date(Date.now() + EMAIL_VERIFICATION_TTL_SECONDS * 1000),
      },
    });

    await this.mail.sendVerificationCode(email, code);
    return code;
  }

  /**
   * Luong client (`POST /auth/verify-email`): xac thuc theo **email** vi client
   * chua dang nhap nen khong co `userId`.
   */
  async verifyByEmail(email: string, code: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
      select: { id: true, emailVerifiedAt: true },
    });
    if (!user) throw AppException.notFound('User');

    if (user.emailVerifiedAt) {
      throw new AppException(
        ErrorCode.EMAIL_ALREADY_VERIFIED,
        409,
        'This email is already verified',
      );
    }

    return this.verify(user.id, code);
  }

  /**
   * Kiem tra ma roi danh dau email da xac thuc.
   *
   * Nem loi cu the (`EXPIRED` vs `INVALID`) de UI bao "ma het han, gui lai"
   * thay vi "ma sai" khi nguoi dung nhìn lai email da lau.
   */
  async verify(userId: string, code: string): Promise<UserResponseDto> {
    const record = await this.prisma.emailVerificationToken.findFirst({
      where: { userId, consumedAt: null, tokenHash: this.hashCode(code) },
    });

    if (!record) {
      throw new AppException(
        ErrorCode.INVALID_VERIFICATION_CODE,
        400,
        'Verification code is incorrect',
      );
    }

    if (record.expiresAt < new Date()) {
      // Xoa ngay de user khong nhan "het han" lien tuc ma ma do lai.
      await this.prisma.emailVerificationToken.delete({ where: { id: record.id } });
      throw new AppException(
        ErrorCode.VERIFICATION_CODE_EXPIRED,
        400,
        'Verification code has expired, please request a new one',
      );
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        emailVerifiedAt: new Date(),
        // Tu dong chuyen `PENDING` -> `ACTIVE`.
        status: 'ACTIVE',
      },
    });

    await this.prisma.emailVerificationToken.update({
      where: { id: record.id },
      data: { consumedAt: new Date() },
    });

    this.logger.log(`Xac thuc email thanh cong: ${user.email}`);
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
      status: user.status as UserStatus,
      authProvider: user.authProvider as AuthProvider,
      emailVerifiedAt: user.emailVerifiedAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  /**
   * SHA-256 kem `JWT_ACCESS_SECRET` lam salt.
   *
   * Ma 6 chu so chi co 1 trieu gia tri nen duoc muon o du, nhung phai gan
   * secret: neu chi hash ma, database bi lo thi ke xau tra bang 1 trieu
   * truy van hash la ra toan bo ma dang hieu luc.
   */
  private hashCode(code: string): string {
    const salt = this.config.get<string>('JWT_ACCESS_SECRET', '');
    return createHash('sha256').update(`${code}:${salt}`).digest('hex');
  }
}
