import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import { CurrentUser, Public } from '../../common/decorators';
import { CommunityService } from './community.service';

@Controller()
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  @Public()
  @Get('community/posts')
  feed(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('regionId') regionId?: string,
    @Query('placeId') placeId?: string,
  ) {
    return this.communityService.findApproved({
      page: Number(page),
      limit: Math.min(Number(limit), 50),
      regionId,
      placeId,
    });
  }

  @Public()
  @Get('community/posts/:id')
  detail(@Param('id', ParseUUIDPipe) id: string) {
    return this.communityService.findOne(id, false);
  }

  @Post('community/posts')
  create(@Body() body: Record<string, unknown>, @CurrentUser() user: { id: string; email: string; role: string }) {
    return this.communityService.create(body as Parameters<typeof this.communityService.create>[0], user as Parameters<typeof this.communityService.create>[1]);
  }

  @Delete('community/posts/:id')
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: { id: string; email: string; role: string }) {
    return this.communityService.remove(id, user as Parameters<typeof this.communityService.remove>[1]);
  }

  @Get('community/posts/me')
  myPosts(@CurrentUser() user: { id: string; email: string; role: string }) {
    return this.communityService.findMyPosts(user.id);
  }
}
