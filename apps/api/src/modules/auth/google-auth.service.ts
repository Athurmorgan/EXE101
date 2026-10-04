import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, randomBytes } from 'node:crypto';
import { DEFAULT_LOCALE } from '@vivivu/shared';
import { PrismaService } from '../../prisma/prisma.service';
import { AppException, ErrorCode } from '../../common/errors/app.exception';
import type { Prisma } from '@prisma/client';

/** Thong tin sau khi Google xac thuc thanh cong. */
export interface GoogleIdentity {
  /** `sub` — dinh danh tai khoan Google, khong doi theo thoi gian. */
  sub: string;
  email: string;
  name: string | null;
  picture: string | null;
}

const AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const TOKENINFO_URL = 'https://oauth2.googleapis.com/tokeninfo';

/**
 * Xu ly dang nhap / lien ket tai khoan Google.
 *
 * Hai kieu client khac nhau nen hai luong khac nhau:
 * - **Web** khong giu duoc client secret nen di qua `GET /auth/google`
 *   (302 sang Google) roi `GET /auth/google/callback` de server doi `code`.
 * - **Mobile** da duoc Google cap `idToken` ro, gui len `POST /auth/google`.
 *
 * Service nay **chi lo phan dinh danh** — tra ve ban ghi `User` da san sang.
 * Cap token la vie cua `AuthService` (noi duy nhat biet `JwtService`).
 */
@Injectable()
export class GoogleAuthService {
  private readonly logger = new Logger(GoogleAuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  // -------------------------------------------------------------------------
  // Config
  // -------------------------------------------------------------------------

  /**
   * Google chua duoc cau hinh -> client nen bao loi ro rang thay vi bam
   * "redirect_uri invalid" khoi Google (hard hieu hon nhieu).
   */
  isConfigured(): boolean {
    return Boolean(this.clientId() && this.clientSecret());
  }

  private assertConfigured(): void {
    if (!this.isConfigured()) {
      throw AppException.conflict(
        'Google login is not configured on this server (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET)',
      );
    }
  }

  private clientId(): string {
    return this.config.get<string>('GOOGLE_CLIENT_ID', '');
  }

  private clientSecret(): string {
    return this.config.get<string>('GOOGLE_CLIENT_SECRET', '');
  }

  private redirectUri(): string {
    return (
      this.config.get<string>('GOOGLE_REDIRECT_URI') ??
      'http://localhost:3000/api/v1/auth/google/callback'
    );
  }

  // -------------------------------------------------------------------------
  // Web — chuyen huong
  // -------------------------------------------------------------------------

  /**
   * URL dong Google de xin quyen.
   *
   * `response_type=code` de server doi `code` lay `idToken` — khong dung
   * `implicit` (`response_type=token`) vi `idToken` se lo trong URL va de
   * loang cho XSS. `prompt=select_account` de chon duoc tai khoan khac thay
   * vi cuon hien tai.
   */
  buildAuthUrl(state: string): string {
    this.assertConfigured();
    const params = new URLSearchParams({
      client_id: this.clientId(),
      redirect_uri: this.redirectUri(),
      response_type: 'code',
      scope: 'openid email profile',
      include_granted_scopes: 'true',
      prompt: 'select_account',
      state,
    });
    return `${AUTH_URL}?${params.toString()}`;
  }

  /** Doi `code` lay `idToken`, roi xac thuc. */
  async exchangeCode(code: string): Promise<GoogleIdentity> {
    this.assertConfigured();

    const body = new URLSearchParams({
      code,
      client_id: this.clientId(),
      client_secret: this.clientSecret(),
      redirect_uri: this.redirectUri(),
      grant_type: 'authorization_code',
    });

    const response = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });

    if (!response.ok) {
      this.logger.warn(`Doi Google code that bai: HTTP ${response.status}`);
      throw new AppException(
        ErrorCode.INVALID_GOOGLE_TOKEN,
        401,
        'Failed to exchange Google authorization code',
      );
    }

    const json = (await response.json()) as { id_token?: string };
    if (!json.id_token) {
      throw new AppException(
        ErrorCode.INVALID_GOOGLE_TOKEN,
        401,
        'Google did not return an idToken',
      );
    }

    return this.verifyIdToken(json.id_token);
  }

  // -------------------------------------------------------------------------
  // Xac thuc idToken
  // -------------------------------------------------------------------------

  /**
   * Mobile gui `idToken` len -> xac thuc -> tra ve ban ghi `User`.
   */
  async authenticate(idToken: string): Promise<Prisma.UserGetPayload<object>> {
    return this.resolveIdentity(await this.verifyIdToken(idToken));
  }

  /**
   * Kiem tra `idToken` bang `tokeninfo` cua Google.
   *
   * Dung endpoint chinh thuc thay vi tu giai ma JWT: Google da kiem tra chu ky,
   * `exp` va `iss` giup API — bo qua `jose` + JWKS cache (thu vien con chua
   * co trong monorepo). Doi lai phai goi mang moi lan dang nhap Google, chung
   * thu tu do dong phai thong thu. Neu can offline, doi sang `jose`.
   */
  private async verifyIdToken(idToken: string): Promise<GoogleIdentity> {
    const response = await fetch(
      `${TOKENINFO_URL}?${new URLSearchParams({ id_token: idToken }).toString()}`,
    );

    if (!response.ok) {
      throw new AppException(
        ErrorCode.INVALID_GOOGLE_TOKEN,
        401,
        'Google token is invalid or expired',
      );
    }

    const claims = (await response.json()) as {
      sub?: string;
      email?: string;
      aud?: string;
      email_verified?: string | boolean;
      name?: string;
      picture?: string;
    };

    // `tokeninfo` **khong** kiem tra `aud` — phai so sanh thu cong, neu khong
    // idToken cap cho app khac cung chay qua duoc.
    if (claims.aud !== this.clientId()) {
      throw new AppException(
        ErrorCode.INVALID_GOOGLE_TOKEN,
        401,
        'Google token was issued for a different application',
      );
    }

    if (!claims.sub || !claims.email) {
      throw new AppException(
        ErrorCode.INVALID_GOOGLE_TOKEN,
        401,
        'Google token is missing subject or email',
      );
    }

    // Android/iOS tra `"true"` (chuoi) trong khi backend cua Google tra
    // `true` (boolean) — phai so sanh ca hai, khong duoc chi so sanh chuoi.
    const verified = claims.email_verified === 'true' || claims.email_verified === true;
    if (!verified) {
      throw AppException.forbidden(
        'Google account email is not verified',
        ErrorCode.GOOGLE_EMAIL_NOT_VERIFIED,
      );
    }

    return {
      sub: claims.sub,
      email: claims.email,
      name: claims.name ?? null,
      picture: claims.picture ?? null,
    };
  }

  // -------------------------------------------------------------------------
  // Dieu phoi tai khoan
  // -------------------------------------------------------------------------

  /**
   * Ba nhanh khi dang nhap Google:
   * 1. `googleId` da ton tai → dang nhap that.
   * 2. `email` trung tai khoan LOCAL → **lien ket** Google vao tai khoan do.
   * 3. Chua co gi → tao moi, `role = USER`, email da xac thuc san.
   *
   * Nhanh 2 giu nguyen mat khau cua tai khoan local, nen nguoi dung da co
   * mat khau van dang nhap bang mat khau duoc nhu chua.
   */
  async resolveIdentity(identity: GoogleIdentity): Promise<Prisma.UserGetPayload<object>> {
    const email = identity.email.trim().toLowerCase();

    // 1. Da tung lien ket Google truoc do.
    const linked = await this.prisma.user.findUnique({ where: { googleId: identity.sub } });
    if (linked) {
      this.assertNotBlocked(linked.status, email);
      return linked;
    }

    // 2. Email da co tai khoan → link thay vi tao tai khoan trung email.
    const byEmail = await this.prisma.user.findUnique({ where: { email } });
    if (byEmail) {
      if (byEmail.googleId && byEmail.googleId !== identity.sub) {
        throw AppException.conflict(
          'This email is already linked to a different Google account',
        );
      }

      this.assertNotBlocked(byEmail.status, email);

      const updated = await this.prisma.user.update({
        where: { id: byEmail.id },
        data: {
          googleId: identity.sub,
          avatarUrl: identity.picture ?? byEmail.avatarUrl,
          // Google da xac thuc email nen danh dau xac thuc luon.
          emailVerifiedAt: byEmail.emailVerifiedAt ?? new Date(),
        },
      });

      this.logger.log(`Lien ket Google vao tai khoan hien co: ${email}`);
      return updated;
    }

    // 3. Tai khoan moi.
    const created = await this.prisma.user.create({
      data: {
        email,
        // `null` = khong duoc phep dang nhap bang mat khau local.
        passwordHash: null,
        fullName: identity.name?.trim() || email.split('@')[0] || 'Google user',
        avatarUrl: identity.picture,
        googleId: identity.sub,
        locale: DEFAULT_LOCALE,
        role: 'USER',
        status: 'ACTIVE',
        authProvider: 'GOOGLE',
        emailVerifiedAt: new Date(),
      },
    });

    this.logger.log(`Tao tai khoan moi tu Google: ${email}`);
    return created;
  }

  /**
   * Google tu xac thuc email, nen `emailVerifiedAt` luon co gia tri → dung
   * de quyet dinh co can phep dang nhap thi khong.
   */
  private assertNotBlocked(status: string, email: string): void {
    if (status === 'SUSPENDED') {
      throw AppException.unauthorized(
        'This account has been suspended',
        ErrorCode.ACCOUNT_SUSPENDED,
      );
    }
    if (status === 'DELETED') {
      throw AppException.unauthorized('This account has been deleted', ErrorCode.ACCOUNT_DELETED);
    }
    this.logger.debug(`Google dang nhap: ${email} (${status})`);
  }

  // -------------------------------------------------------------------------
  // State — chong CSRF khi Google quay lai
  // -------------------------------------------------------------------------

  /**
   * `state` ngau nhien luu trong cookie httpOnly, callback doi chieu.
   *
   * Khong dung `state` thi ke khac len URL `/auth/google/callback` cua ta va
   * nhan `code` cua ho — chinh la "login CSRF" (force user dang nhap bang
   * tai khoan cua ke xau).
   */
  createState(): string {
    return randomBytes(16).toString('base64url');
  }

  hashState(state: string): string {
    return createHash('sha256').update(state).digest('base64url');
  }
}
