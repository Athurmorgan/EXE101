import { ConfigService } from '@nestjs/config';
import type { RedisService } from '../../common/services/redis.service';
import { MapsService } from './maps.service';

describe('MapsService', () => {
  let service: MapsService;
  let fetchMock: jest.SpyInstance;

  const mockConfig = {
    get: jest.fn((key: string) => {
      if (key === 'OSRM_BASE_URL') return 'https://router.project-osrm.org';
      if (key === 'PHOTON_BASE_URL') return 'https://photon.komoot.io';
      if (key === 'NOMINATIM_BASE_URL') return 'https://nominatim.openstreetmap.org';
      if (key === 'MAPS_USER_AGENT') return 'vivivu-test/0.1';
      return undefined;
    }),
  } as unknown as ConfigService;

  const mockRedis = {
    get: jest.fn(async () => null),
    set: jest.fn(async () => undefined),
  } as unknown as RedisService;

  beforeEach(() => {
    service = new MapsService(mockConfig, mockRedis);
    fetchMock = jest.spyOn(globalThis, 'fetch');
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('geocode tra ve ket qua tu Photon khi thanh cong', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        features: [
          {
            geometry: { coordinates: [105.8525, 21.0288] },
            properties: {
              name: 'Hoan Kiem Lake',
              district: 'Hoan Kiem',
              city: 'Hanoi',
              country: 'Vietnam',
              countrycode: 'VN',
              osm_value: 'water',
            },
          },
        ],
      }),
    } as Response);

    const res = await service.geocode('Hoan Kiem', 5, 'vn');
    expect(res.source).toBe('photon');
    expect(res.results).toHaveLength(1);
    expect(res.results[0]).toMatchObject({
      lat: 21.0288,
      lng: 105.8525,
      displayName: 'Hoan Kiem Lake, Hoan Kiem, Hanoi, Vietnam',
    });
    expect(mockRedis.set).toHaveBeenCalledTimes(1);
  });

  it('geocode fallback ve mang rong va khong cache khi ca Photon va Nominatim loi', async () => {
    fetchMock.mockRejectedValueOnce(new Error('photon error'));
    fetchMock.mockRejectedValueOnce(new Error('nominatim error'));

    const res = await service.geocode('Hoan Kiem');
    expect(res).toEqual({ results: [], source: 'fallback' });
    expect(mockRedis.set).not.toHaveBeenCalled();
  });

  it('reverseGeocode tra ve dia chi tu Photon khi thanh cong', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        features: [
          {
            geometry: { coordinates: [105.8542, 21.0285] },
            properties: {
              street: 'Dinh Tien Hoang',
              district: 'Hoan Kiem',
              city: 'Hanoi',
              country: 'Vietnam',
            },
          },
        ],
      }),
    } as Response);

    const res = await service.reverseGeocode(21.0285, 105.8542);
    expect(res.source).toBe('photon');
    expect(res.displayName).toBe('Dinh Tien Hoang, Hoan Kiem, Hanoi, Vietnam');
  });

  it('getRoute tra ve tuyen duong OSRM khi thanh cong', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        code: 'Ok',
        routes: [
          {
            distance: 2450,
            duration: 420,
            geometry: {
              type: 'LineString',
              coordinates: [
                [105.8542, 21.0285],
                [105.8412, 21.0368],
              ],
            },
            legs: [{ distance: 2450, duration: 420 }],
          },
        ],
      }),
    } as Response);

    const res = await service.getRoute(
      [
        { lat: 21.0285, lng: 105.8542 },
        { lat: 21.0368, lng: 105.8412 },
      ],
      'driving',
    );

    expect(res.source).toBe('osrm');
    expect(res.distanceM).toBe(2450);
    expect(res.durationMin).toBe(7);
    expect(res.legs).toEqual([{ distanceM: 2450, durationMin: 7 }]);
    expect(res.geometry.coordinates).toHaveLength(2);
  });

  it('getRoute fallback ve Haversine khi OSRM loi', async () => {
    fetchMock.mockRejectedValueOnce(new Error('OSRM timeout'));

    const res = await service.getRoute(
      [
        { lat: 21.0285, lng: 105.8542 },
        { lat: 21.0368, lng: 105.8412 },
      ],
      'walking',
    );

    expect(res.source).toBe('fallback');
    expect(res.profile).toBe('walking');
    expect(res.distanceM).toBeGreaterThan(1000);
    expect(res.durationMin).toBeGreaterThan(0);
    expect(res.legs).toHaveLength(1);
    expect(res.geometry).toEqual({
      type: 'LineString',
      coordinates: [
        [105.8542, 21.0285],
        [105.8412, 21.0368],
      ],
    });
  });
});
