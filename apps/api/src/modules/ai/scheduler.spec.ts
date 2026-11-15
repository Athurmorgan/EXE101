import { orderByProximity, scheduleDay, type CandidatePlace } from './scheduler';

function place(over: Partial<CandidatePlace> & { id: string; lat: number; lng: number }): CandidatePlace {
  return {
    name: over.id,
    address: null,
    category: 'attraction',
    cuisineType: null,
    mealType: null,
    priceRange: null,
    avgMealPrice: null,
    isHiddenPlace: false,
    googleRating: null,
    aiScore: null,
    description: null,
    openingHours: [],
    saves: 0,
    ...over,
  };
}

// Hoan Kiem (Ha Noi) lam goc; moi 0.01 do ~ 1.1 km.
const origin = { lat: 21.0285, lng: 105.8526 };
// 2026-11-16 la thu Hai (dayOfWeek = 1).
const monday = new Date('2026-11-16T00:00:00Z');

describe('orderByProximity', () => {
  it('di tu gan den xa, khong de duong cheo nhau', () => {
    const far = place({ id: 'far', lat: 21.06, lng: 105.85 });
    const near = place({ id: 'near', lat: 21.03, lng: 105.85 });
    const mid = place({ id: 'mid', lat: 21.045, lng: 105.85 });
    expect(orderByProximity(origin, [far, near, mid]).map((p) => p.id)).toEqual(['near', 'mid', 'far']);
  });
});

describe('scheduleDay', () => {
  it('xep bua an dung slot va tinh gio theo di chuyen', () => {
    const day = scheduleDay({
      dayNumber: 1,
      date: monday,
      startHour: 8,
      origin,
      places: [
        place({ id: 'dinner', category: 'restaurant', mealType: 'dinner', lat: 21.03, lng: 105.86, avgMealPrice: 120000 }),
        place({ id: 'lake', lat: 21.0288, lng: 105.8522 }),
        place({ id: 'pho', category: 'restaurant', mealType: 'breakfast', lat: 21.0278, lng: 105.853, avgMealPrice: 45000 }),
        place({ id: 'bun', category: 'restaurant', mealType: 'lunch', lat: 21.0275, lng: 105.8558 }),
        place({ id: 'cafe', category: 'cafe', lat: 21.0295, lng: 105.8499 }),
        place({ id: 'museum', lat: 21.04, lng: 105.84 }),
      ],
    });

    const byId = Object.fromEntries(day.stops.map((s) => [s.placeId, s]));
    expect(day.stops.map((s) => s.placeId)).toEqual(['pho', 'lake', 'bun', 'museum', 'cafe', 'dinner']);
    // Xuat phat 08:00, di ~150 m (di bo + dem gui xe) → den trong vong 10 phut.
    expect(byId.pho!.scheduledTime > '08:00' && byId.pho!.scheduledTime <= '08:10').toBe(true);
    expect(byId.pho!.mealType).toBe('breakfast');
    expect(byId.bun!.scheduledTime).toBe('11:45');
    expect(byId.cafe!.scheduledTime >= '15:15').toBe(true);
    expect(byId.dinner!.scheduledTime >= '18:30').toBe(true);
    expect(byId.pho!.travelTimeFromPrevMin).toBeGreaterThan(0);
    expect(day.skipped).toEqual([]);
    expect(day.stops.reduce((s, st) => s + st.estimatedCost, 0)).toBe(45000 + 100000 + 120000 + 45000);
  });

  it('doi den gio mo cua va bo dia diem dong cua', () => {
    const day = scheduleDay({
      dayNumber: 1,
      date: monday,
      startHour: 8,
      origin,
      places: [
        place({
          id: 'late-museum',
          lat: 21.029,
          lng: 105.853,
          openingHours: [{ dayOfWeek: 1, openTime: '10:00', closeTime: '17:00', isClosed: false }],
        }),
        place({
          id: 'closed-monday',
          lat: 21.03,
          lng: 105.854,
          openingHours: [{ dayOfWeek: 1, openTime: '08:00', closeTime: '17:00', isClosed: true }],
        }),
      ],
    });
    expect(day.stops.map((s) => s.placeId)).toEqual(['late-museum']);
    expect(day.stops[0]!.scheduledTime).toBe('10:00');
    expect(day.stops[0]!.notes).toBe('Opens 10:00');
    expect(day.skipped).toEqual([{ placeId: 'closed-monday', reason: 'closed that day' }]);
  });

  it('nha hang khong ro bua thi dien vao slot trong, du nha hang thi bo bot', () => {
    const day = scheduleDay({
      dayNumber: 2,
      date: monday,
      startHour: 9,
      origin,
      places: [
        place({ id: 'r1', category: 'restaurant', lat: 21.03, lng: 105.85 }),
        place({ id: 'r2', category: 'restaurant', lat: 21.031, lng: 105.851 }),
        place({ id: 'r3', category: 'restaurant', lat: 21.032, lng: 105.852 }),
        place({ id: 'r4', category: 'restaurant', lat: 21.033, lng: 105.853 }),
      ],
    });
    expect(day.stops.map((s) => s.mealType)).toEqual(['breakfast', 'lunch', 'dinner']);
    expect(day.stops.map((s) => s.placeId)).toEqual(['r3', 'r1', 'r2']);
  });
});
