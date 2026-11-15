import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { CurrentUser, type AuthUser } from '../../common/decorators';
import { ItineraryService } from './itinerary.service';
// Import gia tri (khong `import type`): ValidationPipe can class luc runtime.
import { ApplyOptionDto, CreateItineraryDto } from './dto/itinerary.dto';

@Controller('itineraries')
export class ItineraryController {
  constructor(private readonly itineraryService: ItineraryService) {}

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.itineraryService.findByUser(user.id);
  }

  @Get(':id')
  detail(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: AuthUser) {
    return this.itineraryService.findOne(id, user.id);
  }

  @Post()
  create(@Body() body: CreateItineraryDto, @CurrentUser() user: AuthUser) {
    return this.itineraryService.create(body, user);
  }

  @Post(':id/generate')
  generate(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: AuthUser) {
    return this.itineraryService.generateOptions(id, user);
  }

  @Post(':id/apply')
  apply(@Param('id', ParseUUIDPipe) id: string, @Body() body: ApplyOptionDto, @CurrentUser() user: AuthUser) {
    return this.itineraryService.applyOption(id, body, user);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: AuthUser) {
    return this.itineraryService.remove(id, user);
  }
}
