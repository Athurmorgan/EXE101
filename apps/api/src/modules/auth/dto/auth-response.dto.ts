import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { AuthProvider, Locale, Role, UserStatus } from '@vivivu/shared';

/**
 * Hinh dang tai khoan tra ra client. Khong bao gio day `passwordHash`.
 *
 * DTO response khong qua `ValidationPipe` nen khai bao property that khong can
 * metadata runtime; dung `declare` de TypeScript khong yeu cau constructor.
 * Cac DTO **input** (Register/Login) moi phai khai bao that — xem ghi chu o
 * `register.dto.ts`.
 */
export class UserResponseDto {
  @ApiProperty({ format: 'uuid' })
  declare id: string;

  @ApiProperty({ example: 'khach@example.com' })
  declare email: string;

  @ApiProperty({ example: 'Nguyen Van A' })
  declare fullName: string;

  @ApiProperty({ nullable: true, type: String })
  declare avatarUrl: string | null;

  @ApiProperty({
    nullable: true,
    type: String,
    format: 'date',
    example: '1995-04-12',
    description: 'Ngay sinh. FE tu tinh tuoi tu truong nay.',
  })
  declare dateOfBirth: Date | null;

  @ApiProperty({ nullable: true, type: String, example: '123 Nguyen Hue, Quan 1, TP.HCM' })
  declare address: string | null;

  @ApiProperty({
    example: false,
    description: 'Tai khoan da lien ket Google hay chua. Khong lo `googleId` vi la PII.',
  })
  declare hasGoogleLinked: boolean;

  @ApiProperty({ enum: ['vi', 'en'] })
  declare locale: Locale;

  @ApiProperty({ enum: ['ADMIN', 'MANAGER', 'USER'] })
  declare role: Role;

  @ApiProperty({ enum: ['PENDING', 'ACTIVE', 'SUSPENDED', 'DELETED'] })
  declare status: UserStatus;

  @ApiProperty({ enum: ['LOCAL', 'GOOGLE'] })
  declare authProvider: AuthProvider;

  @ApiProperty({ format: 'date-time', nullable: true, type: Date })
  declare emailVerifiedAt: Date | null;

  @ApiProperty({ format: 'date-time' })
  declare createdAt: Date;

  @ApiProperty({ format: 'date-time' })
  declare updatedAt: Date;
}

/**
 * Ket qua dang ky / dang nhap.
 *
 * `accessToken` nam trong body vi mobile app khong dung cookie.
 * Refresh token nam trong cookie httpOnly — xem `AuthController.setRefreshCookie`.
 */
export class AuthSessionDto {
  @ApiProperty({ type: UserResponseDto })
  declare user: UserResponseDto;

  @ApiProperty({ description: 'Access token, gui qua header Authorization: Bearer' })
  declare accessToken: string;

  @ApiProperty({ example: 900, description: 'So giay con hieu cua access token' })
  declare expiresIn: number;
}

/**
 * Ket qua dang ky moi.
 *
 * `accessToken` co gia null: theo luong san pham, client phai xac thuc email
 * truoc roi moi goi `POST /auth/login` de lay token.
 */
export class RegisterResponseDto {
  @ApiProperty({ type: UserResponseDto })
  declare user: UserResponseDto;

  @ApiProperty({ example: true, description: 'Client phai chuyen toi man hinh nhap ma xac thuc' })
  declare verificationRequired: boolean;

  @ApiPropertyOptional({
    example: '123456',
    nullable: true,
    type: String,
    description: 'Chi co o moi truong development de tien kiem thu. Production luon null.',
  })
  declare devVerificationCode?: string | null;
}

/** Xac nhan xac thuc email thanh cong. */
export class VerifyEmailResponseDto {
  @ApiProperty({ example: true })
  declare verified: boolean;

  @ApiProperty({ type: UserResponseDto })
  declare user: UserResponseDto;
}

/** Thong bao gui lai ma xac thuc. */
export class ResendVerificationResponseDto {
  @ApiProperty({ example: true })
  declare sent: boolean;

  @ApiPropertyOptional({
    example: '123456',
    nullable: true,
    type: String,
    description: 'Chi o moi truong development.',
  })
  declare devVerificationCode?: string | null;
}
