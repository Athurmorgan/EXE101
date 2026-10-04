import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import {
  ROLES,
  USER_SUSPEND_REASON_MAX_LENGTH,
  type Role,
  type UserStatus,
} from '@vivivu/shared';
import { PageQueryDto } from '../../../common/dto/page-query.dto';

/**
 * Query danh sach tai khoan — phan trang + loc.
 *
 * `extends PageQueryDto` de dung **mot** `@Query()` duy nhat. Hai tham so
 * `@Query()` o cung vi tri khong phan bi duoc boi Nest (ca hai deu nhan
 * toan bo query string) nen phan trang se khong chay — va `@Type` cua tham
 * so thu hai bi bo qua nen boolean den dang chuoi.
 */
export class UserQueryDto extends PageQueryDto {
  @ApiPropertyOptional({ enum: ROLES, description: 'Loc theo vai tro' })
  @IsOptional()
  @IsIn(ROLES)
  role?: Role;

  @ApiPropertyOptional({
    enum: ['PENDING', 'ACTIVE', 'SUSPENDED', 'DELETED'],
    description: 'Loc theo trang thai',
  })
  @IsOptional()
  @IsIn(['PENDING', 'ACTIVE', 'SUSPENDED', 'DELETED'])
  status?: UserStatus;

  /**
   * Mac dinh **an** tai khoan da xoa mem — danh sach "nguoi dung" khong nen
   * hien tai khoan da xoa. Admin muon xem thi bat `includeDeleted=true`.
   *
   * `@Type(() => Boolean)` bat buoc: query string luon den dang **chuoi**, nen
   * `?includeDeleted=true` se la `"true"` va `IsBoolean` tu choi. Chi mot flag
   * nen `Boolean("false") === true` la dung — "false" cung la "co flag nay".
   */
  @ApiPropertyOptional({ default: false, description: 'Lay ca tai khoan da xoa mem' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  includeDeleted?: boolean;
}

/** Doi vai tro cua mot tai khoan. */
export class UpdateRoleDto {
  @ApiProperty({ enum: ROLES, example: 'MANAGER' })
  @IsIn(ROLES)
  role!: Role;
}

/** Khoa / mo khoa tai khoan. */
export class SuspendUserDto {
  @ApiPropertyOptional({
    example: 'Vi pham dieu khoan dich vu',
    maxLength: USER_SUSPEND_REASON_MAX_LENGTH,
  })
  @IsOptional()
  @IsString()
  @MaxLength(USER_SUSPEND_REASON_MAX_LENGTH)
  reason?: string;
}

/** Xoa tai khoan. `hard = true` la xoa han, mac dinh xoa mem. */
export class DeleteUserDto {
  @ApiPropertyOptional({
    default: false,
    description:
      'true = xoa han khoi database (mất luôn bài viết/đơn hàng). ' +
      'mac định false = xoá mềm, giữ dữ liệu.',
  })
  @IsOptional()
  @IsBoolean()
  hard?: boolean;
}

/** Xem tai khoan cua admin — gom truong chi danh rieng cho trang quan tri. */
export class AdminUserResponseDto {
  @ApiProperty({ format: 'uuid' })
  declare id: string;

  @ApiProperty()
  declare email: string;

  @ApiProperty()
  declare fullName: string;

  @ApiProperty({ nullable: true, type: String })
  declare avatarUrl: string | null;

  @ApiProperty({ nullable: true, type: String, format: 'date' })
  declare dateOfBirth: Date | null;

  @ApiProperty({ nullable: true, type: String })
  declare address: string | null;

  @ApiProperty({ example: false })
  declare hasGoogleLinked: boolean;

  @ApiProperty({ enum: ['vi', 'en'] })
  declare locale: string;

  @ApiProperty({ enum: ROLES })
  declare role: Role;

  @ApiProperty({ enum: ['PENDING', 'ACTIVE', 'SUSPENDED', 'DELETED'] })
  declare status: UserStatus;

  @ApiProperty({ enum: ['LOCAL', 'GOOGLE'] })
  declare authProvider: string;

  @ApiProperty({ nullable: true, type: String, format: 'date-time' })
  declare emailVerifiedAt: Date | null;

  @ApiProperty({ nullable: true, type: String, format: 'date-time' })
  declare deletedAt: Date | null;

  @ApiProperty({ nullable: true, type: String, format: 'date-time' })
  declare suspendedAt: Date | null;

  @ApiProperty({ nullable: true, type: String })
  declare suspendReason: string | null;

  @ApiProperty({ format: 'date-time' })
  declare createdAt: Date;

  @ApiProperty({ format: 'date-time' })
  declare updatedAt: Date;
}

/** Ket qua thao tac tren tai khoan. */
export class UserActionResultDto {
  @ApiProperty({ format: 'uuid' })
  declare userId: string;

  @ApiProperty({ enum: ['PENDING', 'ACTIVE', 'SUSPENDED', 'DELETED'] })
  declare status: UserStatus;

  @ApiProperty({
    example: true,
    description: 'So phien dang nhap da bi thu hoi (khi khoa tai khoan)',
  })
  declare revokedSessions: number;
}
