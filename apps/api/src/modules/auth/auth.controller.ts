import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import type { CookieOptions, Request, Response } from 'express';
import { CurrentUser, Public, type AuthUser } from '../../common/decorators';
import { AppException, ErrorCode } from '../../common/errors/app.exception';
import { AuthService, toSessionResponse, type IssuedTokens } from './auth.service';
import { GoogleAuthService } from './google-auth.service';
import { VerificationService } from './verification.service';
import {
  AuthSessionDto,
  RegisterResponseDto,
  ResendVerificationResponseDto,
  UserResponseDto,
  VerifyEmailResponseDto,
} from './dto/auth-response.dto';
// KHONG dung `import type` cho DTO — `ValidationPipe` doc `design:paramtypes`
// do `emitDecoratorMetadata` sinh ra. `import type` bi xoa luc bien dich,
// kien thuc do tro thanh `Object` va moi field bao loi "should not exist".
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import {
  ChangePasswordDto,
  GoogleLoginDto,
  ResendVerificationDto,
  UpdateProfileDto,
  VerifyEmailDto,
} from './dto/verification.dto';

/** Ten cookie chua refresh token. JavaScript khoc doc duoc (httpOnly). */
export const REFRESH_COOKIE = 'vivivu_refresh';

/** Cookie tam giu `state` khoi Google — httpOnly de JS khong sua. */
const GOOGLE_STATE_COOKIE = 'vivivu_google_state';

/** Cookie ghi nho frontend quay lai sau khi dang nhap Google xong. */
const GOOGLE_REDIRECT_COOKIE = 'vivivu_google_redirect';

/** Doc cookie tu request. Tra undefined khi khong co — de so sanh an toan. */
function readCookie(request: Request, name: string): string | undefined {
  const cookies = request.cookies as Record<string, string> | undefined;
  return cookies?.[name];
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly google: GoogleAuthService,
    private readonly verification: VerificationService,
    private readonly config: ConfigService,
  ) {}

  @Public()
  @Post('register')
  @ApiOperation({
    summary: 'Dang ky tai khoan moi (email + mat khau)',
    description:
      'Tai khoan duoc tao o trang thai PENDING. Client phai xac thuc email truoc ' +
      'roi moi goi POST /auth/login de lay token.',
  })
  @ApiResponse({ status: 201, type: RegisterResponseDto })
  @ApiResponse({ status: 409, description: 'Email da duoc su dung' })
  async register(@Body() dto: RegisterDto): Promise<RegisterResponseDto> {
    const { user } = await this.auth.register(dto);
    // Gui ma ngay khi dang ky — client khong can goi them mot request.
    const code = await this.verification.issueCode(user.id, user.email);
    return { user, verificationRequired: true, devVerificationCode: this.devCode(code) };
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Dang bang email + mat khau' })
  @ApiResponse({ status: 200, type: AuthSessionDto })
  @ApiResponse({ status: 401, description: 'Sai email hoac mat khau' })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthSessionDto> {
    const { user, tokens } = await this.auth.login(dto);
    this.setRefreshCookie(response, tokens);
    return toSessionResponse(user, tokens);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth(REFRESH_COOKIE)
  @ApiOperation({ summary: 'Xoay vong token tu cookie refresh' })
  @ApiResponse({ status: 200, type: AuthSessionDto })
  @ApiResponse({ status: 401, description: 'Refresh token het han hoac da thu hoi' })
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthSessionDto> {
    const { user, tokens } = await this.auth.refresh(this.readRefreshCookie(request));
    this.setRefreshCookie(response, tokens);
    return toSessionResponse(user, tokens);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiCookieAuth(REFRESH_COOKIE)
  @ApiOperation({ summary: 'Ket thuc phien hien tai' })
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    await this.auth.logout(this.readRefreshCookie(request));
    response.clearCookie(REFRESH_COOKIE, this.cookieOptions());
  }

  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Ket thuc phien tren moi thiet bi' })
  async logoutAll(@CurrentUser('id') userId: string): Promise<{ revokedSessions: number }> {
    return { revokedSessions: await this.auth.logoutAll(userId) };
  }

  @Get('me')
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Thong tin tai khoan dang dang nhap' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  me(@CurrentUser() user: AuthUser): Promise<UserResponseDto> {
    return this.auth.findById(user.id);
  }

  // -------------------------------------------------------------------------
  // Xac thuc email
  // -------------------------------------------------------------------------

  @Public()
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Xac nhan ma xac thuc email',
    description:
      'Ma lay tu email dang ky. Khi ma dung, tai khoan chuyen PENDING -> ACTIVE. ' +
      'Sau do client goi POST /auth/login de nhan token.',
  })
  @ApiResponse({ status: 200, type: VerifyEmailResponseDto })
  @ApiResponse({ status: 400, description: 'Ma sai hoac het han' })
  async verifyEmail(@Body() dto: VerifyEmailDto): Promise<VerifyEmailResponseDto> {
    const user = await this.verification.verifyByEmail(dto.email, dto.code);
    return { verified: true, user };
  }

  @Public()
  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Gui lai ma xac thuc email' })
  @ApiResponse({ status: 200, type: ResendVerificationResponseDto })
  async resendVerification(@Body() dto: ResendVerificationDto): Promise<ResendVerificationResponseDto> {
    const user = await this.auth.findUserByEmail(dto.email ?? '');
    if (user.emailVerifiedAt) {
      throw AppException.conflict('This email is already verified');
    }

    const code = await this.verification.issueCode(user.id, user.email);
    return { sent: true, devVerificationCode: this.devCode(code) };
  }

  @Post('update-profile')
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Cap nhat ho so ca nhan' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  updateProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateProfileDto,
  ): Promise<UserResponseDto> {
    return this.auth.updateProfile(userId, dto);
  }

  @Post('change-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiCookieAuth()
  @ApiOperation({
    summary: 'Doi mat khau',
    description: 'Doi xong thi moi phien tren moi thiet bi deu bi thu hoi.',
  })
  @ApiResponse({ status: 204, description: 'Doi mat khau thanh cong' })
  async changePassword(
    @CurrentUser('id') userId: string,
    @Body() dto: ChangePasswordDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    await this.auth.changePassword(userId, dto);
    response.clearCookie(REFRESH_COOKIE, this.cookieOptions());
  }

  // -------------------------------------------------------------------------
  // Google OAuth
  // -------------------------------------------------------------------------

  @Public()
  @Get('google')
  @ApiOperation({ summary: 'Chuyen huong sang Google de dang nhap (web)' })
  @ApiQuery({ name: 'redirect', required: false, description: 'URL quay lai cua frontend' })
  async googleStart(
    @Res() response: Response,
    @Query('redirect') redirect?: string,
  ): Promise<void> {
    const state = this.google.createState();
    // Cookie httpOnly chong CSRF: khi Google quay lai, doi chieu `state`.
    response.cookie(GOOGLE_STATE_COOKIE, this.google.hashState(state), {
      ...this.cookieOptions(),
      path: '/api/v1/auth',
      maxAge: 10 * 60 * 1000,
    });

    const target = this.safeRedirect(redirect);
    if (target) response.cookie(GOOGLE_REDIRECT_COOKIE, target, this.cookieOptions());

    response.redirect(this.google.buildAuthUrl(state));
  }

  @Public()
  @Get('google/callback')
  @ApiOperation({ summary: 'Google quay lai — doi code lay token' })
  @ApiQuery({ name: 'code', required: true })
  @ApiQuery({ name: 'state', required: true })
  async googleCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<void> {
    const expected = readCookie(request, GOOGLE_STATE_COOKIE);
    if (!expected || expected !== this.google.hashState(state)) {
      throw new AppException(
        ErrorCode.INVALID_GOOGLE_TOKEN,
        400,
        'Google login session expired, please try again',
      );
    }

    const identity = await this.google.exchangeCode(code);
    const user = await this.google.resolveIdentity(identity);
    const { user: dto, tokens } = await this.auth.loginWithGoogleUser(user);

    this.setRefreshCookie(response, tokens);
    response.clearCookie(GOOGLE_STATE_COOKIE, this.cookieOptions());

    // Web khong doc duoc cookie httpOnly `accessToken` (access token khong nam
    // trong cookie) → phai chuyen qua query de frontend nhan duoc. Chi dung
    // `token` (access, 15 phut), **khong** phai refresh token.
    const target = readCookie(request, GOOGLE_REDIRECT_COOKIE);
    response.clearCookie(GOOGLE_REDIRECT_COOKIE, this.cookieOptions());

    const destination = target ?? `${this.frontendUrl()}/auth/callback`;
    const params = new URLSearchParams({
      access_token: tokens.accessToken,
      email: dto.email,
    });
    response.redirect(`${destination}?${params.toString()}`);
  }

  @Public()
  @Post('google')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Dang nhap / lien ket bang idToken tu Google (mobile)',
    description:
      'Neu email da co tai khoan trong he thong → lien ket Google vao tai khoan do, ' +
      'khong tao tai khoan moi.',
  })
  @ApiResponse({ status: 200, type: AuthSessionDto })
  async googleLogin(
    @Body() dto: GoogleLoginDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthSessionDto> {
    const user = await this.google.authenticate(dto.idToken);
    const { user: dtoUser, tokens } = await this.auth.loginWithGoogleUser(user);
    this.setRefreshCookie(response, tokens);
    return toSessionResponse(dtoUser, tokens);
  }

  // -------------------------------------------------------------------------

  /**
   * `httpOnly` + `sameSite: 'lax'` nen JavaScript khong lay duoc token va trinh
   * duyet khong gui sang cross-site request. `secure` bat buoc khi deploy HTTPS.
   */
  private setRefreshCookie(response: Response, tokens: IssuedTokens): void {
    response.cookie(REFRESH_COOKIE, tokens.refreshToken, {
      ...this.cookieOptions(),
      maxAge:
        this.auth.durationInSeconds(this.config.get<string>('JWT_REFRESH_EXPIRES_IN', '30d')) * 1000,
    });
  }

  private readRefreshCookie(request: Request): string | undefined {
    return readCookie(request, REFRESH_COOKIE);
  }

  private cookieOptions(): CookieOptions {
    const domain = this.config.get<string>('COOKIE_DOMAIN');
    const path = this.config.get<string>('COOKIE_PATH', '/api/v1/auth');

    return {
      httpOnly: true,
      secure: this.isSecureCookie(),
      sameSite: 'lax',
      path,
      ...(domain ? { domain } : {}),
    };
  }

  /**
   * `ConfigService` tra moi bien moi truong ve dang **chuoi**, nen chuoi `"false"`
   * van la truthy. Phai so sanh chuoi explicitly — dung `get<boolean>()` se
   * tra chuoi va lam cookie luon co `Secure`, khong gui duoc tren HTTP local.
   */
  private isSecureCookie(): boolean {
    const value = this.config.get<string>('COOKIE_SECURE')?.trim().toLowerCase();
    if (value === 'true') return true;
    if (value === 'false') return false;

    // Khong khai bao thi coi nhu local: khong bat Secure de trinh duyet gui duoc.
    return false;
  }

  private frontendUrl(): string {
    return this.config.get<string>('FRONTEND_URL', 'http://localhost:5173');
  }

  /**
   * Chi cho phep chuyen huong ve cung mot host cua frontend.
   *
   * Khong kiem tra thi `?redirect=` la open redirect — ke xau dung de dan
   * nguoi dung từ app ra trang phishing sau khi dang nhap Google.
   */
  private safeRedirect(candidate: string | undefined): string | null {
    if (!candidate) return null;
    const allowed = this.config
      .get<string>('CORS_ORIGINS', '')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean);
    if (allowed.length === 0) return null;
    return allowed.includes(candidate) ? candidate : null;
  }

  /** Chi o moi truong development moi tra ma ve client de tien kiem thu. */
  private devCode(code: string): string | null {
    return this.config.get<string>('NODE_ENV') === 'production' ? null : code;
  }
}
