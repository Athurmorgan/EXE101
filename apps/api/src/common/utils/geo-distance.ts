/**
 * Tinh khoang cach giua 2 toa do lat/lng (don vi: km) bang cong thuc Haversine.
 *
 * a = sin^2((lat2 - lat1)/2) + cos(lat1) * cos(lat2) * sin^2((lng2 - lng1)/2)
 * c = 2 * atan2(sqrt(a), sqrt(1-a))
 * d = R * c (R = 6371 km)
 */
export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371; // ban kinh trai dat (km)
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Uoc tinh thoi gian di chuyen (phut) theo khoang cach va phuong tien.
 *
 * Toc do trung binh (km/h):
 *   - walking: 5
 *   - driving: 30 (trong thanh pho, co the dinh do)
 *   - transit: 20 (xe buyt)
 */
export function estimateTravelTime(
  distanceKm: number,
  mode: 'walking' | 'driving' | 'transit' = 'driving',
): number {
  const speedKmh = mode === 'walking' ? 5 : mode === 'transit' ? 20 : 30;
  return Math.round((distanceKm / speedKmh) * 60);
}

/**
 * Tu (lat, lng, radiusKm) tra ve bounding box de query Prisma - dung de loc
 * nhanh cac place gan vi tri hien tai truoc khi tinh khoang cach chinh xac.
 */
export function boundingBox(
  lat: number,
  lng: number,
  radiusKm: number,
): { minLat: number; maxLat: number; minLng: number; maxLng: number } {
  // 1 do lat ~= 111 km; 1 do lng phu thuoc lat (he so = cos(lat) * 111)
  const latDelta = radiusKm / 111;
  const lngDelta = radiusKm / (111 * Math.cos((lat * Math.PI) / 180));
  return {
    minLat: lat - latDelta,
    maxLat: lat + latDelta,
    minLng: lng - lngDelta,
    maxLng: lng + lngDelta,
  };
}
