import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../common/services/redis.service';
import { cacheKey } from '../../common/utils/cache-key';
import { boundingBox } from '../../common/utils/geo-distance';
import { AppException, ErrorCode } from '../../common/errors/app.exception';
import { createProviders, extractJson, type LlmProvider } from './llm';
import { scheduleDay, type CandidatePlace, type LatLng, type ScheduledDay, type ScheduledStop } from './scheduler';
import type { GenerateItineraryDto, TripStyle } from './dto/ai.dto';

/**
 * AI itinerary planner — ba buoc tach biet:
 *
 *   1. RETRIEVE  Lay dia diem APPROVED trong vung (hoac quanh diem xuat phat)
 *                tu Postgres, kem gio mo cua va so luot luu. Day la "grounding":
 *                model chi duoc chon trong danh sach nay, khong duoc bia.
 *   2. SELECT    LLM (Claude/Gemini) chon tap dia diem cho tung ngay cua 5
 *                phuong an, dat ten va mo ta. Khong co key / loi → heuristic
 *                cham diem theo phong cach, van cho ra 5 phuong an.
 *   3. SCHEDULE  `scheduler.ts` sap thu tu, tinh gio, di chuyen, bua an.
 *
 * Nho vay moi stop luon co `placeId` that, va phan gio giac khong phu thuoc
 * vao viec model "doan".
 */
@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly providers: LlmProvider[];
  private nextProvider = 0;

  constructor(
    config: ConfigService,
    private readonly redis: RedisService,
    private readonly prisma: PrismaService,
  ) {
    this.providers = createProviders(config);
    this.logger.log(
      this.providers.length
        ? `LLM providers: ${this.providers.map((p) => p.name).join(', ')}`
        : 'Khong co LLM key — planner chay heuristic',
    );
  }

  async generate5Options(dto: GenerateItineraryDto): Promise<AiItineraryOptions> {
    const days = AiService.calculateDays(dto.startDate, dto.endDate);
    const region = await this.prisma.region.findUnique({ where: { id: dto.regionId } });
    if (!region) throw AppException.notFound('Region');

    const origin: LatLng =
      dto.startLat != null && dto.startLng != null ? { lat: dto.startLat, lng: dto.startLng } : { lat: region.lat, lng: region.lng };
    const preferredIds = [...new Set(dto.preferredPlaceIds ?? [])];
    const candidates = await this.loadCandidates(dto.regionId, origin, preferredIds);
    if (candidates.length === 0) {
      throw new AppException(ErrorCode.VALIDATION_FAILED, 422, `No approved places in ${region.name} yet`);
    }

    return this.redis.getOrSet(
      cacheKey('ai:itin', {
        regionId: dto.regionId,
        startDate: dto.startDate,
        endDate: dto.endDate,
        styles: [...(dto.styles ?? [])].sort().join(','),
        dietary: dto.dietary ?? '',
        budget: dto.budgetVnd ?? 0,
        travelers: dto.travelers ?? 0,
        preferred: [...preferredIds].sort().join(','),
        origin: `${origin.lat.toFixed(3)},${origin.lng.toFixed(3)}`,
        startHour: dto.startHour ?? 0,
        // Dia diem moi duoc duyet phai lam moi cache.
        pool: candidates.map((c) => c.id).sort().join(','),
      }),
      1800,
      async () => {
        const llm = await this.selectWithLlm(dto, region.name, days, origin, candidates, preferredIds);
        const selections = llm?.selections ?? heuristicSelection(candidates, days, dto, preferredIds);
        const options = selections.map((sel, i) => this.buildOption(sel, i + 1, dto, days, origin, candidates));
        return {
          options,
          source: llm ? 'llm' : 'heuristic',
          provider: llm?.provider,
          candidateCount: candidates.length,
        };
      },
    );
  }

  // ---------------------------------------------------------------------------
  // 1. RETRIEVE
  // ---------------------------------------------------------------------------

  private async loadCandidates(regionId: string, origin: LatLng, preferredIds: string[]): Promise<CandidatePlace[]> {
    const box = boundingBox(origin.lat, origin.lng, 30);
    const select = {
      id: true,
      name: true,
      lat: true,
      lng: true,
      address: true,
      category: true,
      cuisineType: true,
      mealType: true,
      priceRange: true,
      avgMealPrice: true,
      isHiddenPlace: true,
      googleRating: true,
      aiScore: true,
      description: true,
      openingHours: { select: { dayOfWeek: true, openTime: true, closeTime: true, isClosed: true } },
      _count: { select: { shortlists: true } },
    } as const;

    const [pool, preferred] = await Promise.all([
      this.prisma.place.findMany({
        where: {
          status: 'APPROVED',
          OR: [
            { regionId },
            { lat: { gte: box.minLat, lte: box.maxLat }, lng: { gte: box.minLng, lte: box.maxLng } },
          ],
        },
        orderBy: [{ aiScore: { sort: 'desc', nulls: 'last' } }, { googleRating: { sort: 'desc', nulls: 'last' } }],
        take: 80,
        select,
      }),
      preferredIds.length
        ? this.prisma.place.findMany({ where: { id: { in: preferredIds }, status: 'APPROVED' }, select })
        : Promise.resolve([]),
    ]);

    const seen = new Set<string>();
    const merged: CandidatePlace[] = [];
    for (const row of [...preferred, ...pool]) {
      if (seen.has(row.id)) continue;
      seen.add(row.id);
      const { _count, ...rest } = row;
      merged.push({ ...rest, saves: _count.shortlists });
    }
    return merged;
  }

  // ---------------------------------------------------------------------------
  // 2. SELECT (LLM)
  // ---------------------------------------------------------------------------

  private async selectWithLlm(
    dto: GenerateItineraryDto,
    regionName: string,
    days: number,
    origin: LatLng,
    candidates: CandidatePlace[],
    preferredIds: string[],
  ): Promise<{ selections: Selection[]; provider: string } | null> {
    if (this.providers.length === 0) return null;
    const prompt = buildPrompt(dto, regionName, days, origin, candidates, preferredIds);

    for (let attempt = 0; attempt < this.providers.length; attempt++) {
      const provider = this.providers[(this.nextProvider + attempt) % this.providers.length]!;
      try {
        const text = await provider.complete(prompt);
        const parsed = extractJson<{ options?: RawOption[] }>(text);
        const selections = validateSelections(parsed.options ?? [], candidates, days, dto, preferredIds);
        this.nextProvider = (this.nextProvider + attempt + 1) % this.providers.length;
        return { selections, provider: provider.name };
      } catch (err) {
        this.logger.warn(`${provider.name} failed: ${(err as Error).message}`);
      }
    }
    this.logger.error('All LLM providers failed — falling back to heuristic selection');
    return null;
  }

  // ---------------------------------------------------------------------------
  // 3. SCHEDULE
  // ---------------------------------------------------------------------------

  private buildOption(
    sel: Selection,
    optionNumber: number,
    dto: GenerateItineraryDto,
    days: number,
    origin: LatLng,
    candidates: CandidatePlace[],
  ): AiItineraryOption {
    const byId = new Map(candidates.map((c) => [c.id, c]));
    const start = new Date(dto.startDate);
    const scheduled: ScheduledDay[] = [];
    for (let d = 1; d <= days; d++) {
      const ids = sel.days.get(d) ?? [];
      const date = new Date(start.getTime() + (d - 1) * 86_400_000);
      scheduled.push(
        scheduleDay({
          dayNumber: d,
          date,
          startHour: dto.startHour ?? 8,
          origin,
          places: ids.map((id) => byId.get(id)).filter((p): p is CandidatePlace => Boolean(p)),
        }),
      );
    }
    const estimatedCost = scheduled.reduce((sum, day) => sum + day.stops.reduce((s, st) => s + st.estimatedCost, 0), 0);
    return { optionNumber, title: sel.title, description: sel.description, estimatedCost, days: scheduled };
  }

  /** Tính số ngày giữa hai ISO date (YYYY-MM-DD). Cộng 1 để tính cả ngày đi và về.
   *  Math.max(1, …) đảm bảo khi start = end thì trả về 1. */
  static calculateDays(start: string, end: string): number {
    const s = new Date(start);
    const e = new Date(end);
    const diffMs = e.getTime() - s.getTime();
    return Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)) + 1);
  }
}

// =============================================================================
// Prompt + validation
// =============================================================================

interface RawOption {
  title?: unknown;
  description?: unknown;
  days?: Array<{ dayNumber?: unknown; placeIds?: unknown }>;
}

/** Ket qua chon dia diem (chua co gio giac) cua mot phuong an. */
export interface Selection {
  title: string;
  description: string;
  /** dayNumber → placeIds */
  days: Map<number, string[]>;
}

export function buildPrompt(
  dto: GenerateItineraryDto,
  regionName: string,
  days: number,
  origin: LatLng,
  candidates: CandidatePlace[],
  preferredIds: string[],
): string {
  const lines = candidates.map((c) =>
    [
      c.id,
      c.name,
      c.category,
      c.cuisineType ?? '-',
      c.mealType ?? '-',
      c.priceRange ?? '-',
      c.isHiddenPlace ? 'hidden-gem' : '-',
      c.googleRating != null ? `${c.googleRating}★` : '-',
      `${c.saves} saves`,
      (c.description ?? '').replace(/\s+/g, ' ').slice(0, 90),
    ].join(' | '),
  );
  const budget = dto.budgetVnd ? `${dto.budgetVnd.toLocaleString('en-US')} VND per person for the whole trip` : 'flexible';
  const startPoint = dto.startLabel ? `${dto.startLabel} (${origin.lat.toFixed(4)}, ${origin.lng.toFixed(4)})` : 'city centre';

  return `You are the trip planner for Vivivu, a Vietnam travel app whose places are vetted by locals.
Plan ${days} day(s) in ${regionName}, ${dto.startDate} to ${dto.endDate}.
Travellers: ${dto.travelers ?? 2}. Styles: ${dto.styles?.join(', ') || 'general'}. Dietary: ${dto.dietary ?? 'none'}. Budget: ${budget}.
Each day starts from: ${startPoint}.

CANDIDATE PLACES — you may ONLY use these ids, never invent a place:
id | name | category | cuisine | meal | price | hidden | rating | saves | note
${lines.join('\n')}

${preferredIds.length ? `MUST INCLUDE in every option (any day): ${preferredIds.join(', ')}\n` : ''}Rules:
- Return exactly 5 options with clearly different themes (e.g. food-first, culture, slow pace, hidden gems, best-of).
- Per day choose up to 3 restaurants (ideally one breakfast, one lunch, one dinner by the meal column), at most 1 cafe, and 2–4 attractions/shopping. Do not repeat a place within an option.
- Prefer hidden gems and places with many saves. Respect the dietary preference and budget.
- You only pick places; times and routes are computed by the app, so do not output times.
- Title ≤ 6 words, description ≤ 30 words, in English.

Respond with JSON only:
{"options":[{"title":"...","description":"...","days":[{"dayNumber":1,"placeIds":["..."]}]}]}`;
}

/** Loc id la, ep dung so ngay, bao dam dia diem bat buoc; thieu phuong an thi bu bang heuristic. */
export function validateSelections(
  raw: RawOption[],
  candidates: CandidatePlace[],
  days: number,
  dto: GenerateItineraryDto,
  preferredIds: string[],
): Selection[] {
  const known = new Set(candidates.map((c) => c.id));
  const selections: Selection[] = [];

  for (const opt of raw.slice(0, 5)) {
    const used = new Set<string>();
    const dayMap = new Map<number, string[]>();
    for (const day of opt.days ?? []) {
      const n = Number(day.dayNumber);
      if (!Number.isInteger(n) || n < 1 || n > days) continue;
      const ids = Array.isArray(day.placeIds) ? (day.placeIds as unknown[]) : [];
      const clean = ids.filter((id): id is string => typeof id === 'string' && known.has(id) && !used.has(id));
      clean.forEach((id) => used.add(id));
      dayMap.set(n, [...(dayMap.get(n) ?? []), ...clean]);
    }
    for (const id of preferredIds) {
      if (used.has(id) || !known.has(id)) continue;
      const target = shortestDay(dayMap, days);
      dayMap.set(target, [...(dayMap.get(target) ?? []), id]);
      used.add(id);
    }
    const stops = [...dayMap.values()].flat().length;
    if (stops === 0) continue;
    selections.push({
      title: typeof opt.title === 'string' && opt.title.trim() ? opt.title.trim().slice(0, 60) : `Plan ${selections.length + 1}`,
      description: typeof opt.description === 'string' ? opt.description.trim().slice(0, 240) : '',
      days: dayMap,
    });
  }

  if (selections.length < 5) {
    const fill = heuristicSelection(candidates, days, dto, preferredIds);
    while (selections.length < 5) selections.push(fill[selections.length]!);
  }
  return selections;
}

function shortestDay(dayMap: Map<number, string[]>, days: number): number {
  let best = 1;
  let bestLen = Infinity;
  for (let d = 1; d <= days; d++) {
    const len = dayMap.get(d)?.length ?? 0;
    if (len < bestLen) {
      bestLen = len;
      best = d;
    }
  }
  return best;
}

// =============================================================================
// Heuristic selection — chay khi khong co LLM key hoac LLM loi.
// =============================================================================

interface Theme {
  title: string;
  description: string;
  weight: (p: CandidatePlace) => number;
}

const THEMES: Theme[] = [
  {
    title: 'Best of the city',
    description: 'The places locals send their friends to first: top-rated, well saved, easy to reach.',
    weight: (p) => (p.googleRating ?? 3) + p.saves * 0.3,
  },
  {
    title: 'Eat your way through',
    description: 'Food first — every meal is a destination and the sights fill the gaps between them.',
    weight: (p) => (p.category === 'restaurant' ? 2 : p.category === 'cafe' ? 1 : 0),
  },
  {
    title: 'Hidden corners',
    description: 'Local favourites that are not on the usual maps, picked by people who live here.',
    weight: (p) => (p.isHiddenPlace ? 3 : 0) + p.saves * 0.2,
  },
  {
    title: 'Slow mornings',
    description: 'Fewer stops, longer coffees, one highlight a day and time to wander.',
    weight: (p) => (p.category === 'cafe' ? 2 : p.category === 'attraction' ? 1 : 0),
  },
  {
    title: 'Culture & sights',
    description: 'Landmarks, markets and history, with good food close to each one.',
    weight: (p) => (p.category === 'attraction' ? 2 : p.category === 'shopping' ? 1 : 0),
  },
];

const STYLE_WEIGHTS: Record<TripStyle, (p: CandidatePlace) => number> = {
  foodie: (p) => (p.category === 'restaurant' || p.category === 'cafe' ? 1 : 0),
  cultural: (p) => (p.category === 'attraction' ? 1 : 0),
  relaxation: (p) => (p.category === 'cafe' ? 0.8 : 0),
  adventure: (p) => (p.category === 'attraction' ? 0.6 : 0),
  family: (p) => (p.category === 'attraction' || p.category === 'shopping' ? 0.5 : 0),
  budget: (p) => (p.priceRange === 'budget' ? 1 : p.priceRange === 'high-end' ? -1.5 : 0),
  luxury: (p) => (p.priceRange === 'high-end' ? 1 : p.priceRange === 'budget' ? -0.5 : 0),
};

export function heuristicSelection(
  candidates: CandidatePlace[],
  days: number,
  dto: GenerateItineraryDto,
  preferredIds: string[],
): Selection[] {
  const preferred = new Set(preferredIds);
  const styles = dto.styles ?? [];
  const dietary = dto.dietary ?? 'none';

  return THEMES.map((theme, index) => {
    const score = (p: CandidatePlace): number => {
      let s = theme.weight(p) + (p.aiScore ?? p.googleRating ?? 3) * 0.5 + (p.isHiddenPlace ? 0.5 : 0);
      for (const st of styles) s += STYLE_WEIGHTS[st]?.(p) ?? 0;
      if ((dietary === 'vegetarian' || dietary === 'vegan') && p.category === 'restaurant') {
        s += p.cuisineType === 'vegetarian' ? 2 : p.cuisineType === 'bbq' || p.cuisineType === 'seafood' ? -2 : 0;
      }
      if (preferred.has(p.id)) s += 100;
      return s;
    };
    // Xoay vong theo index de 5 phuong an khong giong het nhau khi pool nho.
    const ranked = rotate([...candidates].sort((a, b) => score(b) - score(a)), index);
    const slow = theme.title === 'Slow mornings';
    const picker = new Picker(ranked);
    const dayMap = new Map<number, string[]>();

    for (let d = 1; d <= days; d++) {
      const ids: string[] = [];
      const take = (pred: (p: CandidatePlace) => boolean, n: number): number => {
        const got = picker.take(pred, n);
        ids.push(...got);
        return got.length;
      };
      const isRestaurant = (p: CandidatePlace) => p.category === 'restaurant';
      take((p) => isRestaurant(p) && (p.mealType === 'breakfast' || p.mealType === 'all-day' || !p.mealType), 1);
      if (!take((p) => isRestaurant(p) && p.mealType === 'lunch', 1)) take(isRestaurant, 1);
      if (!take((p) => isRestaurant(p) && p.mealType === 'dinner', 1)) take(isRestaurant, 1);
      take((p) => p.category === 'cafe', 1);
      take((p) => p.category === 'attraction' || p.category === 'shopping', slow ? 2 : 3);
      dayMap.set(d, ids);
    }

    // Bat buoc co preferred: neu chua vao thi them vao ngay it diem nhat.
    const used = new Set([...dayMap.values()].flat());
    for (const id of preferredIds) {
      if (used.has(id) || !candidates.some((c) => c.id === id)) continue;
      const target = shortestDay(dayMap, days);
      dayMap.set(target, [...(dayMap.get(target) ?? []), id]);
    }
    return { title: theme.title, description: theme.description, days: dayMap };
  });
}

/** Lay dia diem chua dung; pool het thi cho phep dung lai (nhieu ngay, it dia diem) thay vi de ngay trong. */
class Picker {
  private readonly used = new Set<string>();
  constructor(private readonly ranked: CandidatePlace[]) {}

  take(pred: (p: CandidatePlace) => boolean, n: number): string[] {
    const out: string[] = [];
    for (const p of this.ranked) {
      if (out.length >= n) break;
      if (!this.used.has(p.id) && pred(p)) {
        this.used.add(p.id);
        out.push(p.id);
      }
    }
    if (out.length === 0) {
      const any = this.ranked.find(pred);
      if (any) out.push(any.id);
    }
    return out;
  }
}

function rotate<T>(arr: T[], by: number): T[] {
  if (arr.length === 0) return arr;
  const k = (by * 2) % arr.length;
  return [...arr.slice(k), ...arr.slice(0, k)];
}

// =============================================================================
// Output types
// =============================================================================

export type AiStop = ScheduledStop;
export type AiDay = ScheduledDay;

export interface AiItineraryOption {
  optionNumber: number;
  title: string;
  description: string;
  /** Tong chi phi uoc tinh MOT NGUOI (VND). */
  estimatedCost: number;
  days: AiDay[];
}

export interface AiItineraryOptions {
  options: AiItineraryOption[];
  source: 'llm' | 'heuristic';
  provider?: string;
  candidateCount: number;
}
