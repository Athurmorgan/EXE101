import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { Public } from '../../common/decorators';
import { RegionsService } from './regions.service';
import type { Region } from '@prisma/client';

@Controller('regions')
export class RegionsController {
  constructor(private readonly regionsService: RegionsService) {}

  @Public()
  @Get()
  async list(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('q') q?: string,
    @Query('sortBy') sortBy?: string,
    @Query('order') order?: 'asc' | 'desc',
    @Query('isCity') isCity?: string,
  ) {
    return this.regionsService.findAll({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
      q,
      sortBy,
      order,
      filters: isCity !== undefined ? { isCity: isCity === 'true' } : undefined,
    });
  }

  @Public()
  @Get('cities')
  cities(): Promise<Region[]> {
    return this.regionsService.findMajorCities();
  }

  @Public()
  @Get(':id')
  async detail(@Param('id', ParseUUIDPipe) id: string): Promise<Region> {
    return this.regionsService.findOne(id);
  }

  @Public()
  @Get(':id/children')
  children(@Param('id', ParseUUIDPipe) id: string): Promise<Region[]> {
    return this.regionsService.findChildren(id);
  }
}
