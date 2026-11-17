import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../../common/services/redis.service';
import { cacheKey } from '../../common/utils/cache-key';
import { estimateTravelTime, haversineDistance } from '../../common/utils/geo-distance';
import type { RouteProfile } from './dto/maps.dto';

export interface GeocodeResultItem {
  lat: number;
  lng: number;
  displayName: string;
  type?: string;
  address?: Record<string, string>;
}

export interface GeocodeResponse {
  results: GeocodeResultItem[];
  source: 'photon' | 'nominatim' | 'fallback';
}

export interface ReverseGeocodeResponse {
  lat: number;
  lng: number;
  displayName: string | null;
  address: Record<string, string> | null;
  source: 'photon' | 'nominatim' | 'fallback';
}

export interface RouteLeg {
  distanceM: number;
  durationMin: number;
}

export interface RouteGeometry {
  type: 'LineString';
  /** GeoJSON order: [lng, lat][] */
  coordinates: Array<[number, number]>;
}

export interface RouteResponse {
  profile: RouteProfile;
  distanceM: number;
  durationMin: number;
  legs: RouteLeg[];
  geometry: RouteGeometry;
  source: 'osrm' | 'fallback';
}

interface PhotonFeature {
  geometry: { coordinates: [number, number] };
  properties: {
    name?: string;
    housenumber?: string;
    street?: string;
    locality?: string;
    district?: string;
    city?: string;
    state?: string;
    country?: string;
    countrycode?: string;
    osm_value?: string;
    type?: string;
  };
}

interface PhotonFeatureCollection {
  features?: PhotonFeature[];
}

interface NominatimSearchRow {
  lat: string;
  lon: string;
  display_name: string;
  type?: string;
  address?: Record<string, string>;
}

interface NominatimReverseRow {
  display_name?: string;
  address?: Record<string, string>;
  error?: string;
}

interface OsrmRouteApiResponse {
  code: string;
  routes?: Array<{
    distance: number;
    duration: number;
    geometry: RouteGeometry;
    legs: Array<{ distance: number; duration: number }>;
  }>;
}

const REQUEST_TIMEOUT_MS = 8_000;
const GEOCODE_CACHE_TTL_SEC = 86_400; // 24h
const ROUTE_CACHE_TTL_SEC = 3_600; // 1h

@Injectable()
export class MapsService {
  private readonly logger = new Logger(MapsService.name);
  private readonly osrmBaseUrl: string;
  private readonly photonBaseUrl: string;
  private readonly nominatimBaseUrl: string;
  private readonly userAgent: string;

  constructor(
    private readonly config: ConfigService,
    private readonly redis: RedisService,
  ) {
    this.osrmBaseUrl = (
      this.config.get<string>('OSRM_BASE_URL') || 'https://router.project-osrm.org'
    ).replace(/\/+$/, '');
    this.photonBaseUrl = (
      this.config.get<string>('PHOTON_BASE_URL') || 'https://photon.komoot.io'
    ).replace(/\/+$/, '');
    this.nominatimBaseUrl = (
      this.config.get<string>('NOMINATIM_BASE_URL') || 'https://nominatim.openstreetmap.org'
    ).replace(/\/+$/, '');
    this.userAgent =
      this.config.get<string>('MAPS_USER_AGENT') || 'vivivu-api/0.1 (contact@vivivu.vn)';
  }

  async geocode(
    q: string,
    limit = 5,
    countrycodes = 'vn',
  ): Promise<GeocodeResponse> {
    const normalizedQ = q.trim();
    const key = cacheKey('maps:geocode:v2', {
      q: normalizedQ.toLowerCase(),
      limit,
      countrycodes: countrycodes.toLowerCase(),
    });

    return this.cacheUnlessFallback(key, GEOCODE_CACHE_TTL_SEC, async () => {
      try {
        return await this.geocodeWithPhoton(normalizedQ, limit, countrycodes);
      } catch (photonErr: unknown) {
        this.logger.warn(`Photon geocode failed, trying Nominatim: ${(photonErr as Error).message}`);
      }

      try {
        return await this.geocodeWithNominatim(normalizedQ, limit, countrycodes);
      } catch (nomErr: unknown) {
        this.logger.warn(`Geocode fallback (q="${normalizedQ}"): ${(nomErr as Error).message}`);
        return { results: [], source: 'fallback' as const };
      }
    });
  }

  async reverseGeocode(lat: number, lng: number): Promise<ReverseGeocodeResponse> {
    const roundedLat = Math.round(lat * 10_000) / 10_000;
    const roundedLng = Math.round(lng * 10_000) / 10_000;
    const key = cacheKey('maps:reverse:v2', { lat: roundedLat, lng: roundedLng });

    return this.cacheUnlessFallback(key, GEOCODE_CACHE_TTL_SEC, async () => {
      try {
        return await this.reverseWithPhoton(lat, lng);
      } catch (photonErr: unknown) {
        this.logger.warn(`Photon reverse failed, trying Nominatim: ${(photonErr as Error).message}`);
      }

      try {
        return await this.reverseWithNominatim(lat, lng);
      } catch (nomErr: unknown) {
        this.logger.warn(`Reverse geocode fallback (${lat},${lng}): ${(nomErr as Error).message}`);
        return { lat, lng, displayName: null, address: null, source: 'fallback' as const };
      }
    });
  }

  async getRoute(
    waypoints: Array<{ lat: number; lng: number }>,
    profile: RouteProfile = 'driving',
  ): Promise<RouteResponse> {
    const roundedWaypoints = waypoints.map((w) => ({
      lat: Math.round(w.lat * 10_000) / 10_000,
      lng: Math.round(w.lng * 10_000) / 10_000,
    }));
    const key = cacheKey('maps:route:v2', { profile, waypoints: roundedWaypoints });

    return this.cacheUnlessFallback(key, ROUTE_CACHE_TTL_SEC, async () => {
      try {
        // OSRM nhan toa do theo thu tu `lng,lat` va map profile: driving | foot | bike
        const osrmProfile = profile === 'walking' ? 'foot' : profile === 'cycling' ? 'bike' : 'driving';
        const coords = waypoints.map((w) => `${w.lng},${w.lat}`).join(';');
        const url = `${this.osrmBaseUrl}/route/v1/${osrmProfile}/${coords}?overview=full&geometries=geojson`;

        const res = await fetch(url, {
          headers: { 'User-Agent': this.userAgent, Accept: 'application/json' },
          signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        });
        if (!res.ok) {
          throw new Error(`OSRM HTTP ${res.status}`);
        }
        const data = (await res.json()) as OsrmRouteApiResponse;
        const primary = data.routes?.[0];
        if (data.code !== 'Ok' || !primary) {
          throw new Error(`OSRM code=${data.code}`);
        }

        return {
          profile,
          distanceM: Math.round(primary.distance),
          durationMin: Math.max(1, Math.round(primary.duration / 60)),
          legs: primary.legs.map((leg) => ({
            distanceM: Math.round(leg.distance),
            durationMin: Math.max(1, Math.round(leg.duration / 60)),
          })),
          geometry: primary.geometry,
          source: 'osrm' as const,
        };
      } catch (error: unknown) {
        this.logger.warn(`OSRM route fallback (${profile}): ${(error as Error).message}`);
        return this.buildHaversineFallbackRoute(waypoints, profile);
      }
    });
  }

  private async geocodeWithPhoton(
    q: string,
    limit: number,
    countrycodes: string,
  ): Promise<GeocodeResponse> {
    const params = new URLSearchParams({
      q,
      limit: String(Math.min(limit * 2, 20)),
    });
    const res = await fetch(`${this.photonBaseUrl}/api/?${params.toString()}`, {
      headers: { 'User-Agent': this.userAgent, Accept: 'application/json' },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    if (!res.ok) {
      throw new Error(`Photon HTTP ${res.status}`);
    }
    const data = (await res.json()) as PhotonFeatureCollection;
    const allowedCountries = countrycodes
      .split(',')
      .map((c) => c.trim().toLowerCase())
      .filter(Boolean);

    const features = (data.features ?? []).filter((f) => {
      if (allowedCountries.length === 0) return true;
      const code = f.properties.countrycode?.toLowerCase();
      return !code || allowedCountries.includes(code);
    });

    return {
      results: features.slice(0, limit).map((f) => this.mapPhotonFeature(f)),
      source: 'photon',
    };
  }

  private async reverseWithPhoton(lat: number, lng: number): Promise<ReverseGeocodeResponse> {
    const params = new URLSearchParams({
      lat: String(lat),
      lon: String(lng),
    });
    const res = await fetch(`${this.photonBaseUrl}/reverse?${params.toString()}`, {
      headers: { 'User-Agent': this.userAgent, Accept: 'application/json' },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    if (!res.ok) {
      throw new Error(`Photon reverse HTTP ${res.status}`);
    }
    const data = (await res.json()) as PhotonFeatureCollection;
    const first = data.features?.[0];
    if (!first) {
      return { lat, lng, displayName: null, address: null, source: 'photon' };
    }
    const mapped = this.mapPhotonFeature(first);
    return {
      lat,
      lng,
      displayName: mapped.displayName,
      address: mapped.address ?? null,
      source: 'photon',
    };
  }

  private mapPhotonFeature(feature: PhotonFeature): GeocodeResultItem {
    const [lng, lat] = feature.geometry.coordinates;
    const p = feature.properties;
    const streetLine = [p.housenumber, p.street].filter(Boolean).join(' ').trim();
    const parts = [p.name, streetLine, p.locality, p.district, p.city ?? p.state, p.country].filter(
      (v, idx, arr): v is string => Boolean(v) && arr.indexOf(v) === idx,
    );
    const address: Record<string, string> = {};
    if (p.street) address.road = p.street;
    if (p.district) address.district = p.district;
    if (p.city) address.city = p.city;
    if (p.country) address.country = p.country;

    return {
      lat,
      lng,
      displayName: parts.join(', '),
      type: p.osm_value ?? p.type,
      address: Object.keys(address).length > 0 ? address : undefined,
    };
  }

  private async geocodeWithNominatim(
    q: string,
    limit: number,
    countrycodes: string,
  ): Promise<GeocodeResponse> {
    const params = new URLSearchParams({
      q,
      format: 'jsonv2',
      addressdetails: '1',
      limit: String(limit),
      countrycodes,
    });
    const res = await fetch(`${this.nominatimBaseUrl}/search?${params.toString()}`, {
      headers: { 'User-Agent': this.userAgent, Accept: 'application/json' },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    if (!res.ok) {
      throw new Error(`Nominatim search HTTP ${res.status}`);
    }
    const rows = (await res.json()) as NominatimSearchRow[];
    return {
      results: rows.map((row) => ({
        lat: Number(row.lat),
        lng: Number(row.lon),
        displayName: row.display_name,
        type: row.type,
        address: row.address,
      })),
      source: 'nominatim',
    };
  }

  private async reverseWithNominatim(lat: number, lng: number): Promise<ReverseGeocodeResponse> {
    const params = new URLSearchParams({
      lat: String(lat),
      lon: String(lng),
      format: 'jsonv2',
      addressdetails: '1',
    });
    const res = await fetch(`${this.nominatimBaseUrl}/reverse?${params.toString()}`, {
      headers: { 'User-Agent': this.userAgent, Accept: 'application/json' },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    if (!res.ok) {
      throw new Error(`Nominatim reverse HTTP ${res.status}`);
    }
    const data = (await res.json()) as NominatimReverseRow;
    if (data.error) {
      return { lat, lng, displayName: null, address: null, source: 'nominatim' };
    }
    return {
      lat,
      lng,
      displayName: data.display_name ?? null,
      address: data.address ?? null,
      source: 'nominatim',
    };
  }

  /** Chi cache ket qua that, khong cache ket qua fallback de request sau thu lai duoc. */
  private async cacheUnlessFallback<T extends { source: string }>(
    key: string,
    ttlSeconds: number,
    loader: () => Promise<T>,
  ): Promise<T> {
    try {
      const cached = await this.redis.get(key);
      if (cached) return JSON.parse(cached) as T;
    } catch {
      // bo qua loi Redis, van goi loader binh thuong
    }

    const fresh = await loader();
    if (fresh.source !== 'fallback') {
      try {
        await this.redis.set(key, JSON.stringify(fresh), ttlSeconds);
      } catch {
        // bo qua loi Redis
      }
    }
    return fresh;
  }

  private buildHaversineFallbackRoute(
    waypoints: Array<{ lat: number; lng: number }>,
    profile: RouteProfile,
  ): RouteResponse {
    const travelMode = profile === 'walking' ? 'walking' : profile === 'cycling' ? 'transit' : 'driving';
    const legs: RouteLeg[] = [];
    let totalDistanceM = 0;
    let totalDurationMin = 0;

    for (let i = 1; i < waypoints.length; i++) {
      const prev = waypoints[i - 1]!;
      const curr = waypoints[i]!;
      const distKm = haversineDistance(prev.lat, prev.lng, curr.lat, curr.lng);
      const distM = Math.round(distKm * 1000);
      const durationMin = Math.max(1, estimateTravelTime(distKm, travelMode));
      legs.push({ distanceM: distM, durationMin });
      totalDistanceM += distM;
      totalDurationMin += durationMin;
    }

    return {
      profile,
      distanceM: totalDistanceM,
      durationMin: totalDurationMin,
      legs,
      geometry: {
        type: 'LineString',
        coordinates: waypoints.map((w) => [w.lng, w.lat]),
      },
      source: 'fallback',
    };
  }
}
