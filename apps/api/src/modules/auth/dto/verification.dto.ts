import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import {
  EMAIL_VERIFICATION_CODE_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  USER_ADDRESS_MAX_LENGTH,
  USER_FULL_NAME_MAX_LENGTH,
} from '@vivivu/shared';
import { IsAgeInRange } from '../../../common/validators/is-age-in-range.validator';

/** `idToken` do Google Sign-In (Android/iOS/web SDK) cap — xac thuc o server. */
export class GoogleLoginDto {
  @ApiProperty({ description: 'Google idToken (khong phai accessToken)' })
  @IsString()
  @IsNotEmpty()
  idToken!: string;
}

/**
 * Xac thuc email bang ma 6 chu so.
 *
 * Client gui kem `email` de server biet can xac thuc tai khoan nao — ma duy
 * nhat trong DB nen khong lo duoc. Ma 6 chu so khong phai mat khau nen khong
 * can rate limit manh theo tai khoan, chi can chan o `VerificationService`.
 */
export class VerifyEmailDto {
  @ApiProperty({ example: 'khach@example.com' })
  @IsEmail({}, { message: 'Email is invalid' })
  email!: string;

  @ApiProperty({ example: '123456', description: 'Ma xac thuc 6 chu so' })
  @IsString()
  @Length(EMAIL_VERIFICATION_CODE_LENGTH, EMAIL_VERIFICATION_CODE_LENGTH, {
    message: `Verification code must be exactly ${EMAIL_VERIFICATION_CODE_LENGTH} digits`,
  })
  code!: string;
}

/** Gui lai ma xac thuc khi nguoi dung khong nhin thay email dau tien. */
export class ResendVerificationDto {
  @ApiProperty({ example: 'khach@example.com' })
  @IsEmail({}, { message: 'Email is invalid' })
  email!: string;
}

/** Doi mat khau — chi dung khi da dang nhap. */
export class ChangePasswordDto {
  @ApiProperty()
  @IsString()
  @MinLength(PASSWORD_MIN_LENGTH)
  @MaxLength(PASSWORD_MAX_LENGTH)
  currentPassword!: string;

  @ApiProperty()
  @IsString()
  @MinLength(PASSWORD_MIN_LENGTH, {
    message: `Password must be at least ${PASSWORD_MIN_LENGTH} characters`,
  })
  @MaxLength(PASSWORD_MAX_LENGTH, {
    message: `Password must be at most ${PASSWORD_MAX_LENGTH} characters`,
  })
  @Matches(/[a-zA-Z]/, { message: 'Password must contain a letter' })
  @Matches(/\d/, { message: 'Password must contain a number' })
  newPassword!: string;
}

/** Cap nhat ho so cua chinh minh nguoi dang dang nhap. */
export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Nguyen Van A' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(USER_FULL_NAME_MAX_LENGTH)
  fullName?: string;

  @ApiPropertyOptional({ example: '1995-04-12' })
  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'Date of birth must be a valid date' })
  @IsAgeInRange()
  dateOfBirth?: Date;

  @ApiPropertyOptional({ maxLength: USER_ADDRESS_MAX_LENGTH })
  @IsOptional()
  @IsString()
  @MaxLength(USER_ADDRESS_MAX_LENGTH)
  address?: string;
}
