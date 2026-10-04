import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { Roles } from '../../common/decorators';
import { UsersService } from './users.service';
import type { AuditActor } from '../audit/audit.service';
// KHONG dung `import type` cho DTO — `ValidationPipe` doc `design:paramtypes` do
// `emitDecoratorMetadata` sinh ra.
import {
  AdminUserResponseDto,
  DeleteUserDto,
  SuspendUserDto,
  UpdateRoleDto,
  UserActionResultDto,
  UserQueryDto,
} from './dto/admin-user.dto';

/**
 * Quan tri tai khoan — chi `ADMIN`.
 *
 * `@Roles('ADMIN')` dat o cap **class** nen moi route deu duoc bao ve; khong
 * endpoint nao cua module nay cho `MANAGER` hay `USER` goi. Quyet dinh
 * "ai duoc phep" nam tren decorator, khong check tay trong service (xem
 * `.cursor/rules/05-auth-and-rbac.mdc`).
 */
@ApiTags('Admin — Users')
@ApiCookieAuth()
@Roles('ADMIN')
@Controller('admin/users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  @ApiOperation({
    summary: 'Danh sach tai khoan',
    description:
      'Mac dinh an tai khoan da xoa mem. them `?includeDeleted=true` de xem ' +
      'ca tai khoan `DELETED` va `SUSPENDED`. Ho tro `?page=&limit=&role=&status=`.',
  })
  @ApiResponse({ status: 200, description: 'Danh sach co phan trang' })
  findAll(@Query() query: UserQueryDto): Promise<{ data: AdminUserResponseDto[]; meta: unknown }> {
    return this.users.findAll(query, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiet mot tai khoan' })
  @ApiResponse({ status: 200, type: AdminUserResponseDto })
  @ApiResponse({ status: 404, description: 'Khong tim thay tai khoan' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<AdminUserResponseDto> {
    return this.users.findOne(id);
  }

  @Patch(':id/role')
  @ApiOperation({
    summary: 'Doi vai tro tai khoan',
    description: 'Khong doi duoc vai tro cua chinh minh. Thu hoi moi phien dang nhap.',
  })
  @ApiResponse({ status: 200, type: AdminUserResponseDto })
  updateRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRoleDto,
    @Req() request: Request,
  ): Promise<AdminUserResponseDto> {
    return this.users.updateRole(id, dto.role, actorOf(request));
  }

  @Post(':id/suspend')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Khoa tai khoan',
    description: 'Chuyen `SUSPENDED` va thu hoi moi phien dang nhap. Dien ly do de hien thi.',
  })
  @ApiResponse({ status: 200, type: UserActionResultDto })
  suspend(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SuspendUserDto,
    @Req() request: Request,
  ): Promise<UserActionResultDto> {
    return this.users.suspend(id, dto, actorOf(request));
  }

  @Post(':id/unsuspend')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mo khoa tai khoan' })
  @ApiResponse({ status: 200, type: UserActionResultDto })
  unsuspend(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request,
  ): Promise<UserActionResultDto> {
    return this.users.unsuspend(id, actorOf(request));
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Xoa tai khoan',
    description:
      'Mac dinh **xoa mem** (gia `deletedAt`, giu bai viet). them body ' +
      '`{ "hard": true }` de xoa han khoi database.',
  })
  @ApiResponse({ status: 200, description: 'Xoa thanh cong' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: DeleteUserDto,
    @Req() request: Request,
  ): Promise<{ userId: string; mode: 'soft' | 'hard' }> {
    return this.users.remove(id, dto, actorOf(request));
  }

  @Post(':id/restore')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Khoi phuc tai khoan da xoa mem',
    description: 'Khong khoi phuc duoc tai khoan da xoa han.',
  })
  @ApiResponse({ status: 200, type: UserActionResultDto })
  restore(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request,
  ): Promise<UserActionResultDto> {
    return this.users.restore(id, actorOf(request));
  }

  @Post(':id/force-logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Thuat moi phien dang nhap',
    description: 'Khong doi trang thai tai khoan — chi thu hoi token.',
  })
  @ApiResponse({ status: 200, description: 'So phien da thu hoi' })
  forceLogout(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request,
  ): Promise<{ userId: string; revokedSessions: number }> {
    return this.users.forceLogout(id, actorOf(request));
  }
}

/**
 * Lay thong tin nguoi goi de ghi audit log.
 *
 * Doc tu `request.user` do `JwtStrategy` gan — giong het `@CurrentUser()` nhung
 * `@Req` de lay them IP/user-agent cho log.
 */
function actorOf(request: Request): AuditActor {
  const user = (request as Request & { user?: { id: string; email: string } }).user;
  return {
    id: user?.id ?? 'unknown',
    email: user?.email ?? 'unknown',
    ip: clientIp(request),
    userAgent: request.get('user-agent') ?? undefined,
  };
}

/**
 * IP thuc cua nguoi goi.
 *
 * `X-Forwarded-For` la do **client tu khai bao** — chi dung khi API nam sau
 * reverse proxy tin cay (nginx/Cloudflare). Doc no truoc `req.ip` de hoat dong
 * duoc sau proxy; neu deploy truc tiep thi bo qua header nay.
 */
function clientIp(request: Request): string | undefined {
  const forwarded = request.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0]?.trim();
  return request.ip;
}
