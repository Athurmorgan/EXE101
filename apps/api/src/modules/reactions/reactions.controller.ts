import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { CurrentUser, Public, type AuthUser } from '../../common/decorators';
import { ReactionsService } from './reactions.service';
import type { CreateReactionDto } from './dto/reaction.dto';
import type { Reaction } from '@prisma/client';

@Controller()
export class ReactionsController {
  constructor(private readonly reactionsService: ReactionsService) {}

  @Public()
  @Get('places/:placeId/reactions/count')
  countByPlace(@Param('placeId', ParseUUIDPipe) placeId: string): Promise<Record<string, number>> {
    return this.reactionsService.countByPlace(placeId);
  }

  @Post('places/:placeId/reactions')
  reactPlace(
    @Param('placeId', ParseUUIDPipe) placeId: string,
    @Body() body: Omit<CreateReactionDto, 'placeId'>,
    @CurrentUser() user: AuthUser,
  ): Promise<Reaction> {
    return this.reactionsService.upsert({ ...body, placeId }, user);
  }

  @Post('posts/:postId/reactions')
  reactPost(
    @Param('postId', ParseUUIDPipe) postId: string,
    @Body() body: Omit<CreateReactionDto, 'postId'>,
    @CurrentUser() user: AuthUser,
  ): Promise<Reaction> {
    return this.reactionsService.upsert({ ...body, postId }, user);
  }

  @Delete('reactions/:id')
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
  ): Promise<{ id: string }> {
    return this.reactionsService.remove(id, user);
  }
}
