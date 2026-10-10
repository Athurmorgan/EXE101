import { Injectable } from '@nestjs/common';
import { haversineDistance, estimateTravelTime } from '../../common/utils/geo-distance';
import type { Prisma, Place } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

interface SchedulePlace {
  id: string;
  name: string;
  lat: number;
  lng: number;
  category: string;
  mealType: string | null;
  avgMealPrice: number | null;
}

@Injectable()
export class PlacesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    name: string;
    lat: number;
    lng: number;
    category: string;
    description?: string;
    address?: string;
    cuisineType?: string;
    mealType?: string;
    priceRange?: string;
    avgMealPrice?: number;
    regionId?: string;
    isHiddenPlace?: boolean;
  }): Promise<Place> {
    return this.prisma.place.create({
      data: {
        name: data.name,
        description: data.description,
        lat: data.lat,
        lng: data.lng,
        address: data.address,
        category: data.category,
        cuisineType: data.cuisineType,
        mealType: data.mealType,
        priceRange: data.priceRange,
        avgMealPrice: data.avgMealPrice,
        regionId: data.regionId,
        isHiddenPlace: data.isHiddenPlace ?? false,
        source: 'USER_SUBMITTED',
        status: 'PENDING',
      },
    }) as unknown as Place;
  }

  async findOne(id: string, includeAllStatuses = false): Promise<Place> {
    const place = await this.prisma.place.findUnique({
      where: { id },
      include: { region: true, photos: { orderBy: { uploadedAt: 'desc' } }, openingHours: { orderBy: { dayOfWeek: 'asc' } } },
    });
    if (!place) throw new Error(`Place ${id} not found`);
    if (!includeAllStatuses && place.status !== 'APPROVED') throw new Error(`Place ${id} not available`);
    return place as Place;
  }

  async update(id: string, data: Partial<{
    name: string; description: string; lat: number; lng: number; address: string;
    category: string; cuisineType: string; mealType: string; priceRange: string; avgMealPrice: number; regionId: string; isHiddenPlace: boolean;
  }>): Promise<Place> {
    return this.prisma.place.update({ where: { id }, data }) as unknown as Place;
  }

  async remove(id: string): Promise<Place> {
    return this.prisma.place.delete({ where: { id } }) as unknown as Place;
  }

  async search(query: {
    q?: string; category?: string; regionId?: string; cuisineType?: string; mealType?: string; priceRange?: string;
    isHiddenPlace?: boolean; lat?: number; lng?: number; radiusKm?: number;
    page?: number; limit?: number; sortBy?: string; order?: 'asc' | 'desc';
  }): Promise<{ data: Place[]; total: number; page: number; limit: number }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.PlaceWhereInput = { status: 'APPROVED' };

    if (query.q) where.name = { contains: query.q, mode: 'insensitive' };
    if (query.category) where.category = query.category;
    if (query.regionId) where.regionId = query.regionId;
    if (query.cuisineType) where.cuisineType = query.cuisineType;
    if (query.mealType) where.mealType = query.mealType;
    if (query.priceRange) where.priceRange = query.priceRange;
    if (query.isHiddenPlace !== undefined) where.isHiddenPlace = query.isHiddenPlace;

    const orderBy: Prisma.PlaceOrderByWithRelationInput =
      query.sortBy === 'name' ? { name: query.order ?? 'desc' } :
      query.sortBy === 'googleRating' ? { googleRating: query.order ?? 'desc' } :
      { createdAt: 'desc' };

    const [total, rows] = await Promise.all([
      this.prisma.place.count({ where }),
      this.prisma.place.findMany({ where, orderBy, skip: (page - 1) * limit, take: limit }),
    ]);

    return { data: rows as Place[], total, page, limit };
  }

  buildSchedule(places: SchedulePlace[], options: { startHour?: number } = {}): Array<{
    placeId: string; name: string; lat: number; lng: number; scheduledTime: string;
    stopType: 'meal' | 'visit'; mealType?: string; estimatedDurationMin: number;
    estimatedCost: number; travelTimeFromPrevMin: number;
  }> {
    if (places.length === 0) return [];
    const ordered = this.nearestNeighborSort(places);
    const startHour = options.startHour ?? 9;
    const schedule: ReturnType<typeof this.buildSchedule> = [];
    let totalMinutes = 0;
    let prevLat: number | null = null;
    let prevLng: number | null = null;

    for (const p of ordered) {
      let travelMin = 0;
      if (prevLat !== null && prevLng !== null) {
        travelMin = estimateTravelTime(haversineDistance(prevLat, prevLng, p.lat, p.lng), 'driving');
      }
      totalMinutes += travelMin;
      const hours = Math.floor((startHour * 60 + totalMinutes) / 60) % 24;
      const minutes = (startHour * 60 + totalMinutes) % 60;
      const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      const isFood = p.category === 'restaurant' || p.category === 'cafe';
      schedule.push({
        placeId: p.id, name: p.name, lat: p.lat, lng: p.lng,
        scheduledTime: timeStr, stopType: isFood ? 'meal' : 'visit',
        mealType: isFood ? (p.mealType ?? 'lunch') : undefined,
        estimatedDurationMin: isFood ? 60 : 90,
        estimatedCost: isFood ? (p.avgMealPrice ?? 50000) : 0,
        travelTimeFromPrevMin: travelMin,
      });
      totalMinutes += isFood ? 60 : 90;
      prevLat = p.lat; prevLng = p.lng;
    }
    return schedule;
  }

  private nearestNeighborSort(places: SchedulePlace[]): SchedulePlace[] {
    if (places.length <= 1) return places;
    const remaining = [...places];
    const sorted: SchedulePlace[] = [];
    const first = remaining.shift();
    if (first) sorted.push(first);
    while (remaining.length > 0) {
      const last = sorted[sorted.length - 1];
      if (!last) break;
      let bestIdx = 0;
      let bestDist = Infinity;
      for (let i = 0; i < remaining.length; i++) {
        const item = remaining[i];
        if (item) {
          const d = haversineDistance(last.lat, last.lng, item.lat, item.lng);
          if (d < bestDist) { bestDist = d; bestIdx = i; }
        }
      }
      const best = remaining.splice(bestIdx, 1)[0];
      if (best) sorted.push(best);
    }
    return sorted;
  }
}
