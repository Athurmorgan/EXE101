import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, Query } from '@nestjs/common';
import { Public } from '../../common/decorators';
import { PlacesService } from './places.service';
import type { Place } from '@prisma/client';

@Controller('places')
export class PlacesController {
  constructor(private readonly placesService: PlacesService) {}

  @Public()
  @Get()
  search(@Query() query: Record<string, string>) {
    return this.placesService.search({
      q: query.q,
      category: query.category,
      regionId: query.regionId,
      cuisineType: query.cuisineType,
      mealType: query.mealType,
      priceRange: query.priceRange,
      isHiddenPlace: query.isHiddenPlace === 'true' ? true : query.isHiddenPlace === 'false' ? false : undefined,
      lat: query.lat ? Number(query.lat) : undefined,
      lng: query.lng ? Number(query.lng) : undefined,
      radiusKm: query.radiusKm ? Number(query.radiusKm) : undefined,
      page: query.page ? Number(query.page) : 1,
      limit: query.limit ? Number(query.limit) : 20,
      sortBy: query.sortBy,
      order: query.order as 'asc' | 'desc' | undefined,
    });
  }

  @Public()
  @Get(':id')
  detail(@Param('id', ParseUUIDPipe) id: string): Promise<Place> {
    return this.placesService.findOne(id, false);
  }

  @Post()
  create(@Body() body: Record<string, unknown>) {
    return this.placesService.create(body as Parameters<typeof this.placesService.create>[0]);
  }

  @Put(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() body: Record<string, unknown>) {
    return this.placesService.update(id, body as Parameters<typeof this.placesService.update>[1]);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<Place> {
    return this.placesService.remove(id);
  }

  @Post('schedule/build')
  async buildSchedule(@Body() body: { placeIds: string[]; startHour?: number }) {
    if (!body.placeIds?.length) return { schedule: [], message: 'placeIds is required' };
    const places = await Promise.all(body.placeIds.map((id) => this.placesService.findOne(id, true)));
    const schedule = this.placesService.buildSchedule(places, { startHour: body.startHour ?? 9 });
    return {
      schedule,
      totalStops: schedule.length,
      estimatedCost: schedule.reduce((sum, s) => sum + s.estimatedCost, 0),
    };
  }
}
