import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import { CurrentUser, Public } from '../../common/decorators';
import { CommunityService } from './community.service';
import { CreatePostDto } from './dto/post.dto';

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

  // Phai khai bao TRUOC `community/posts/:id`: Express khop route theo thu tu
  // dang ky, neu dat sau thi "me" bi coi la `:id` va ParseUUIDPipe tra 400.
  @Get('community/posts/me')
  myPosts(@CurrentUser() user: { id: string; email: string; role: string }) {
    return this.communityService.findMyPosts(user.id);
  }

  @Public()
  @Get('community/posts/:id')
  detail(@Param('id', ParseUUIDPipe) id: string) {
    return this.communityService.findOne(id, false);
  }

  @Post('community/posts')
  create(@Body() body: CreatePostDto, @CurrentUser() user: { id: string; email: string; role: string }) {
    return this.communityService.create(body, user as Parameters<typeof this.communityService.create>[1]);
  }

  @Delete('community/posts/:id')
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: { id: string; email: string; role: string }) {
    return this.communityService.remove(id, user as Parameters<typeof this.communityService.remove>[1]);
  }
}
