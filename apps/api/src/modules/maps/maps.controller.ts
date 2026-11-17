import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators';
import { GeocodeQueryDto, ReverseGeocodeQueryDto, RouteRequestDto } from './dto/maps.dto';
import {
  MapsService,
  type GeocodeResponse,
  type ReverseGeocodeResponse,
  type RouteResponse,
} from './maps.service';

@ApiTags('Maps')
@Controller('maps')
export class MapsController {
  constructor(private readonly mapsService: MapsService) {}

  @Public()
  @Get('geocode')
  @ApiOperation({ summary: 'Tim dia chi / dia diem qua Nominatim (OpenStreetMap)' })
  geocode(@Query() query: GeocodeQueryDto): Promise<GeocodeResponse> {
    return this.mapsService.geocode(query.q, query.limit ?? 5, query.countrycodes ?? 'vn');
  }

  @Public()
  @Get('reverse')
  @ApiOperation({ summary: 'Doi toa do lat/lng thanh dia chi qua Nominatim (OpenStreetMap)' })
  reverse(@Query() query: ReverseGeocodeQueryDto): Promise<ReverseGeocodeResponse> {
    return this.mapsService.reverseGeocode(query.lat, query.lng);
  }

  @Public()
  @Post('route')
  @ApiOperation({ summary: 'Tinh tuyen duong va thoi gian di chuyen qua OSRM (fallback Haversine)' })
  route(@Body() body: RouteRequestDto): Promise<RouteResponse> {
    return this.mapsService.getRoute(body.waypoints, body.profile ?? 'driving');
  }
}

