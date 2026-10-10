import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import { CurrentUser, Roles, type AuthUser } from '../../common/decorators';
import { ModerationService } from './moderation.service';

@Controller('moderation')
@Roles('ADMIN', 'MANAGER')
export class ModerationController {
  constructor(private readonly moderationService: ModerationService) {}

  @Get('queue/:type')
  queue(@Param('type') type: 'posts' | 'places', @CurrentUser() user: AuthUser, @Query('page') page = '1', @Query('limit') limit = '20') {
    return this.moderationService.findPending(type, user, Number(page), Math.min(Number(limit), 50));
  }

  @Post('posts/:id/approve')
  approvePost(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: AuthUser) {
    return this.moderationService.approvePost(id, user);
  }

  @Post('posts/:id/reject')
  rejectPost(@Param('id', ParseUUIDPipe) id: string, @Body() body: { note?: string }, @CurrentUser() user: AuthUser) {
    return this.moderationService.rejectPost(id, user, body.note);
  }

  @Post('places/:id/approve')
  approvePlace(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: AuthUser) {
    return this.moderationService.approvePlace(id, user);
  }

  @Post('places/:id/reject')
  rejectPlace(@Param('id', ParseUUIDPipe) id: string, @Body() body: { note?: string }, @CurrentUser() user: AuthUser) {
    return this.moderationService.rejectPlace(id, user, body.note);
  }
}
