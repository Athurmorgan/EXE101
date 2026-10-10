import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { CurrentUser, Public, type AuthUser } from '../../common/decorators';
import { CommentsService } from './comments.service';
import type { CreateCommentDto } from './dto/comment.dto';
import type { Comment } from '@prisma/client';

@Controller()
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Public()
  @Get('places/:placeId/comments')
  listByPlace(@Param('placeId', ParseUUIDPipe) placeId: string): Promise<Comment[]> {
    return this.commentsService.findByPlace(placeId);
  }

  @Public()
  @Get('posts/:postId/comments')
  listByPost(@Param('postId', ParseUUIDPipe) postId: string): Promise<Comment[]> {
    return this.commentsService.findByPost(postId);
  }

  @Post('places/:placeId/comments')
  createOnPlace(
    @Param('placeId', ParseUUIDPipe) placeId: string,
    @Body() body: Omit<CreateCommentDto, 'placeId'>,
    @CurrentUser() user: AuthUser,
  ): Promise<Comment> {
    return this.commentsService.create({ ...body, placeId }, user);
  }

  @Post('posts/:postId/comments')
  createOnPost(
    @Param('postId', ParseUUIDPipe) postId: string,
    @Body() body: Omit<CreateCommentDto, 'postId'>,
    @CurrentUser() user: AuthUser,
  ): Promise<Comment> {
    return this.commentsService.create({ ...body, postId }, user);
  }

  @Delete('comments/:id')
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
  ): Promise<{ id: string }> {
    return this.commentsService.remove(id, user);
  }
}
