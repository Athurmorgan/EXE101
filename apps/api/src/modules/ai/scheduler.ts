import { estimateTravelTime, haversineDistance } from '../../common/utils/geo-distance';

/**
 * Bo xep lich deterministic cho mot ngay.
 *
 * LLM (hoac heuristic fallback) chi CHON tap dia diem cho tung ngay. Moi thu
 * lien quan den thoi gian — thu tu di, gio den, gio mo cua, bua an dung gio,
 * thoi gian di chuyen — do module nay quyet dinh, nen ket qua kiem tra duoc
 * va khong phu thuoc vao viec model "doan" gio.
 *
 * Thuat toan:
 *   1. Tach dia diem thanh bua an (restaurant), ca phe (cafe) va tham quan.
 *   2. Gan nha hang vao slot sang / trua / toi theo `mealType`, con lai dien
 *      vao slot trong.
 *   3. Sap thu tu tham quan bang nearest-neighbour + 2-opt (TSP nho) tu diem
 *      xuat phat, chia doi truoc/sau bua trua.
 *   4. Chay timeline: cong thoi gian di chuyen (Haversine x toc do xe may),
 *      doi den gio mo cua, bo dia diem dong cua hoac khong kip truoc 22h.
 */

export interface CandidateHours {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

export interface CandidatePlace {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address: string | null;
  category: string;
  cuisineType: string | null;
  mealType: string | null;
  priceRange: string | null;
  avgMealPrice: number | null;
  isHiddenPlace: boolean;
  googleRating: number | null;
  aiScore: number | null;
  description: string | null;
  openingHours: CandidateHours[];
  /** So nguoi da luu vao shortlist — tin hieu cong dong. */
  saves: number;
}

export interface LatLng {
  lat: number;
  lng: number;
}

export interface ScheduledStop {
  placeId: string;
  name: string;
  lat: number;
  lng: number;
  address: string | null;
  category: string;
  stopType: 'meal' | 'visit';
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'coffee' | null;
  scheduledTime: string;
  estimatedDurationMin: number;
  estimatedCost: number;
  travelTimeFromPrevMin: number;
  distanceFromPrevKm: number;
  notes?: string;
}

export interface ScheduledDay {
  dayNumber: number;
  stops: ScheduledStop[];
  totalTravelMin: number;
  totalDistanceKm: number;
  /** Dia diem bi loai va ly do — tra ve de FE/log giai thich duoc. */
  skipped: Array<{ placeId: string; reason: string }>;
}

export interface ScheduleDayInput {
  dayNumber: number;
  /** Ngay thuc te — de tra gio mo cua theo thu trong tuan. */
  date: Date;
  startHour: number;
  origin: LatLng;
  places: CandidatePlace[];
}

type MealSlot = 'breakfast' | 'lunch' | 'dinner' | 'coffee';

/** Gio som nhat cua moi bua (phut tu 00:00). Bua sang = gio xuat phat. */
const SLOT_MIN: Record<Exclude<MealSlot, 'breakfast'>, number> = {
  lunch: 11 * 60 + 45,
  coffee: 15 * 60 + 15,
  dinner: 18 * 60 + 30,
};
const DAY_END_MIN = 22 * 60;
/** Dem them cho gui xe / tim duong. */
const TRANSFER_BUFFER_MIN = 5;
const WALK_THRESHOLD_KM = 0.4;

export function scheduleDay(input: ScheduleDayInput): ScheduledDay {
  const { restaurants, cafes, visits } = split(input.places);
  const meals = assignMeals(restaurants);
  const coffee = cafes[0] ?? null;
  // Quan ca phe du ra thi coi nhu diem tham quan.
  const visitPool = [...visits, ...cafes.slice(1)];

  const ordered = orderByProximity(input.origin, visitPool);
  const half = Math.ceil(ordered.length / 2);
  const morning = ordered.slice(0, half);
  const afternoon = ordered.slice(half);
  const coffeeAt = Math.ceil(afternoon.length / 2);

  const sequence: Array<{ place: CandidatePlace; slot: MealSlot | null }> = [];
  if (meals.breakfast) sequence.push({ place: meals.breakfast, slot: 'breakfast' });
  for (const p of morning) sequence.push({ place: p, slot: null });
  if (meals.lunch) sequence.push({ place: meals.lunch, slot: 'lunch' });
  for (const [i, p] of afternoon.entries()) {
    if (i === coffeeAt && coffee) sequence.push({ place: coffee, slot: 'coffee' });
    sequence.push({ place: p, slot: null });
  }
  if (coffee && coffeeAt >= afternoon.length) sequence.push({ place: coffee, slot: 'coffee' });
  if (meals.dinner) sequence.push({ place: meals.dinner, slot: 'dinner' });

  return runTimeline(input, sequence);
}

function split(places: CandidatePlace[]) {
  const restaurants: CandidatePlace[] = [];
  const cafes: CandidatePlace[] = [];
  const visits: CandidatePlace[] = [];
  for (const p of places) {
    if (p.category === 'restaurant') restaurants.push(p);
    else if (p.category === 'cafe') cafes.push(p);
    else if (p.category !== 'hotel') visits.push(p);
  }
  return { restaurants, cafes, visits };
}

/** Gan nha hang vao bua theo `mealType`; nha hang "all-day"/khong ro dien vao slot trong. */
function assignMeals(restaurants: CandidatePlace[]) {
  const slots: Record<'breakfast' | 'lunch' | 'dinner', CandidatePlace | null> = {
    breakfast: null,
    lunch: null,
    dinner: null,
  };
  const flexible: CandidatePlace[] = [];
  for (const r of restaurants) {
    const t = r.mealType;
    if ((t === 'breakfast' || t === 'lunch' || t === 'dinner') && !slots[t]) slots[t] = r;
    else flexible.push(r);
  }
  for (const key of ['lunch', 'dinner', 'breakfast'] as const) {
    if (!slots[key] && flexible.length) slots[key] = flexible.shift()!;
  }
  return slots;
}

/** Nearest-neighbour tu `origin`, roi 2-opt de go cac doan cheo nhau. */
export function orderByProximity(origin: LatLng, places: CandidatePlace[]): CandidatePlace[] {
  if (places.length <= 1) return [...places];
  const remaining = [...places];
  const route: CandidatePlace[] = [];
  let cursor: LatLng = origin;
  while (remaining.length) {
    let best = 0;
    let bestDist = Infinity;
    for (let i = 0; i < remaining.length; i++) {
      const d = haversineDistance(cursor.lat, cursor.lng, remaining[i]!.lat, remaining[i]!.lng);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    }
    const [next] = remaining.splice(best, 1);
    route.push(next!);
    cursor = next!;
  }
  return twoOpt(origin, route);
}

function twoOpt(origin: LatLng, route: CandidatePlace[]): CandidatePlace[] {
  const dist = (a: LatLng, b: LatLng) => haversineDistance(a.lat, a.lng, b.lat, b.lng);
  const pts: LatLng[] = [origin, ...route];
  let improved = true;
  while (improved) {
    improved = false;
    for (let i = 1; i < pts.length - 1; i++) {
      for (let k = i + 1; k < pts.length; k++) {
        const a = pts[i - 1]!;
        const b = pts[i]!;
        const c = pts[k]!;
        const d = pts[k + 1];
        const before = dist(a, b) + (d ? dist(c, d) : 0);
        const after = dist(a, c) + (d ? dist(b, d) : 0);
        if (after + 1e-9 < before) {
          pts.splice(i, k - i + 1, ...pts.slice(i, k + 1).reverse());
          improved = true;
        }
      }
    }
  }
  return pts.slice(1) as CandidatePlace[];
}

function runTimeline(
  input: ScheduleDayInput,
  sequence: Array<{ place: CandidatePlace; slot: MealSlot | null }>,
): ScheduledDay {
  const dow = input.date.getUTCDay();
  const stops: ScheduledStop[] = [];
  const skipped: ScheduledDay['skipped'] = [];
  let cursor = input.startHour * 60;
  let prev: LatLng = input.origin;
  let totalTravel = 0;
  let totalKm = 0;

  for (const { place, slot } of sequence) {
    const km = haversineDistance(prev.lat, prev.lng, place.lat, place.lng);
    const travel =
      km === 0 ? 0 : estimateTravelTime(km, km < WALK_THRESHOLD_KM ? 'walking' : 'driving') + TRANSFER_BUFFER_MIN;
    let arrive = cursor + travel;
    if (slot && slot !== 'breakfast') arrive = Math.max(arrive, SLOT_MIN[slot]);

    const duration = durationFor(place, slot);
    const hours = place.openingHours.find((h) => h.dayOfWeek === dow);
    let note: string | undefined;
    if (hours) {
      if (hours.isClosed) {
        skipped.push({ placeId: place.id, reason: 'closed that day' });
        continue;
      }
      const open = toMin(hours.openTime);
      const close = toMin(hours.closeTime);
      if (arrive < open) {
        arrive = open;
        note = `Opens ${hours.openTime}`;
      }
      if (arrive + Math.min(duration, 30) > close) {
        skipped.push({ placeId: place.id, reason: `closes ${hours.closeTime}` });
        continue;
      }
    }
    if (arrive + Math.min(duration, 30) > DAY_END_MIN) {
      skipped.push({ placeId: place.id, reason: 'too late in the day' });
      continue;
    }

    stops.push({
      placeId: place.id,
      name: place.name,
      lat: place.lat,
      lng: place.lng,
      address: place.address,
      category: place.category,
      stopType: slot ? 'meal' : 'visit',
      mealType: slot,
      scheduledTime: toHHmm(arrive),
      estimatedDurationMin: duration,
      estimatedCost: costFor(place, slot),
      travelTimeFromPrevMin: travel,
      distanceFromPrevKm: Math.round(km * 10) / 10,
      notes: note,
    });
    totalTravel += travel;
    totalKm += km;
    cursor = arrive + duration;
    prev = place;
  }

  return {
    dayNumber: input.dayNumber,
    stops,
    totalTravelMin: totalTravel,
    totalDistanceKm: Math.round(totalKm * 10) / 10,
    skipped,
  };
}

function durationFor(place: CandidatePlace, slot: MealSlot | null): number {
  if (slot === 'breakfast') return 40;
  if (slot === 'lunch') return 60;
  if (slot === 'dinner') return 75;
  if (slot === 'coffee') return 45;
  switch (place.category) {
    case 'attraction':
      return 90;
    case 'shopping':
      return 60;
    case 'cafe':
      return 45;
    default:
      return 60;
  }
}

const PRICE_RANGE_VND: Record<string, number> = { budget: 60_000, moderate: 150_000, 'high-end': 400_000 };

/** Chi phi uoc tinh cho MOT nguoi (VND). */
function costFor(place: CandidatePlace, slot: MealSlot | null): number {
  if (place.avgMealPrice) return place.avgMealPrice;
  if (slot === 'coffee' || place.category === 'cafe') return 45_000;
  if (slot || place.category === 'restaurant') return PRICE_RANGE_VND[place.priceRange ?? ''] ?? 100_000;
  if (place.priceRange) return PRICE_RANGE_VND[place.priceRange] ?? 0;
  return 0;
}

function toMin(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

function toHHmm(min: number): string {
  const h = Math.floor(min / 60) % 24;
  const m = min % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}
