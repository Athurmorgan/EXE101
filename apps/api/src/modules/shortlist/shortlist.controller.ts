import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put } from '@nestjs/common';
import { CurrentUser, type AuthUser } from '../../common/decorators';
import { ShortlistService } from './shortlist.service';

@Controller('shortlists')
export class ShortlistController {
  constructor(private readonly shortlistService: ShortlistService) {}

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.shortlistService.findByUser(user.id);
  }

  @Post()
  add(@Body() body: { placeId: string; notes?: string; order?: number }, @CurrentUser() user: AuthUser) {
    return this.shortlistService.add(user.id, body);
  }

  @Put(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() body: { notes?: string; order?: number }, @CurrentUser() user: AuthUser) {
    return this.shortlistService.update(id, user.id, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: AuthUser) {
    return this.shortlistService.remove(id, user.id);
  }

  @Post('reorder')
  reorder(@Body() body: { placeIds: string[] }, @CurrentUser() user: AuthUser) {
    return this.shortlistService.reorder(user.id, body.placeIds);
  }
}
