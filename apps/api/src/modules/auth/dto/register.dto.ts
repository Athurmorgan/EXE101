import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import {
  DEFAULT_LOCALE,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  SUPPORTED_LOCALES,
  USER_ADDRESS_MAX_LENGTH,
  type Locale,
} from '@vivivu/shared';
import { IsAgeInRange } from '../../../common/validators/is-age-in-range.validator';

/**
 * Register payload.
 *
 * Khai bao property that (khong dung `declare`) de `emitDecoratorMetadata` tao
 * du `design:type` runtime — `ValidationPipe` can metadata nay de biet field
 * nao bat buoc nhap. Bat buoc khai bao `!` vi class duoc nap qua DI, khong co
 * constructor de gan gia tri.
 */
export class RegisterDto {
  @ApiProperty({ example: 'khach@example.com' })
  @IsEmail({}, { message: 'Email is invalid' })
  email!: string;

  @ApiProperty({ example: 'matkhau123', minLength: PASSWORD_MIN_LENGTH })
  @IsString()
  @MinLength(PASSWORD_MIN_LENGTH, {
    message: `Password must be at least ${PASSWORD_MIN_LENGTH} characters`,
  })
  @MaxLength(PASSWORD_MAX_LENGTH, {
    message: `Password must be at most ${PASSWORD_MAX_LENGTH} characters`,
  })
  @Matches(/[a-zA-Z]/, { message: 'Password must contain a letter' })
  @Matches(/\d/, { message: 'Password must contain a number' })
  password!: string;

  @ApiProperty({ example: 'Nguyen Van A' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  fullName!: string;

  @ApiPropertyOptional({
    example: '1995-04-12',
    description: 'Ngay sinh. Dung de tinh tuoi va dieu chinh noi dung.',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'Date of birth must be a valid date' })
  @IsAgeInRange()
  dateOfBirth?: Date;

  @ApiPropertyOptional({
    example: '123 Nguyen Hue, Quan 1, Ho Chi Minh',
    maxLength: USER_ADDRESS_MAX_LENGTH,
  })
  @IsOptional()
  @IsString()
  @MaxLength(USER_ADDRESS_MAX_LENGTH)
  address?: string;

  @ApiPropertyOptional({ enum: SUPPORTED_LOCALES, default: DEFAULT_LOCALE })
  @IsOptional()
  @IsIn(SUPPORTED_LOCALES)
  locale?: Locale;
}
