/**
 * Model layer: shapes mirrored from the `be` backend (see
 * `EXE101-be/apps/api/prisma/schema.prisma` and the module DTOs).
 * Hand-written for now; `npm run sync:api` on the backend can later generate
 * these from its OpenAPI JSON (`docs/FE_BE_INTEGRATION.md`).
 */

export type Role = 'ADMIN' | 'MANAGER' | 'USER';
export type UserStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'DELETED';
export type Locale = 'vi' | 'en';

export interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  dateOfBirth: string | null;
  address: string | null;
  hasGoogleLinked: boolean;
  locale: Locale;
  role: Role;
  status: UserStatus;
  authProvider: 'LOCAL' | 'GOOGLE';
  emailVerifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthSession {
  user: User;
  accessToken: string;
  expiresIn: number;
}

export interface Region {
  id: string;
  name: string;
  slug: string;
  isCity: boolean;
  lat: number;
  lng: number;
  parentId: string | null;
}

export type PlaceCategory = 'restaurant' | 'cafe' | 'attraction' | 'hotel' | 'shopping';
export type PlaceSource = 'GOOGLE' | 'VERIFIED_LOCAL' | 'USER_SUBMITTED';
export type PlaceStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type PriceRange = 'budget' | 'moderate' | 'high-end';

export interface PlacePhoto {
  id: string;
  url: string;
  caption: string | null;
}

export interface OpeningHour {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

export interface Place {
  id: string;
  name: string;
  description: string | null;
  lat: number;
  lng: number;
  address: string | null;
  category: PlaceCategory | string;
  source: PlaceSource;
  status: PlaceStatus;
  isHiddenPlace: boolean;
  cuisineType: string | null;
  mealType: string | null;
  priceRange: PriceRange | null;
  avgMealPrice: number | null;
  googleRating: number | null;
  googleReviews: number | null;
  regionId: string | null;
  region?: Region | null;
  photos?: PlacePhoto[];
  openingHours?: OpeningHour[];
}

export interface PlaceListResponse {
  data: Place[];
  total: number;
  page: number;
  limit: number;
}

export interface ShortlistItem {
  id: string;
  placeId: string;
  notes: string | null;
  order: number;
  createdAt: string;
  /** Included by `GET /shortlists`; absent on the `POST` response. */
  place?: Place;
}

export const REACTION_TYPES = ['like', 'love', 'wow', 'helpful'] as const;
export type ReactionType = (typeof REACTION_TYPES)[number];

export type ReactionCounts = Partial<Record<ReactionType, number>>;

export interface Reaction {
  id: string;
  type: ReactionType;
  userId: string;
  placeId: string | null;
  postId: string | null;
}

export interface Comment {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar: string | null;
  placeId: string | null;
  postId: string | null;
  parentId: string | null;
  createdAt: string;
  /** Only top-level comments come back with their replies. */
  replies?: Comment[];
}

/** `{ data, total, page, limit }` — the shape list services return before the interceptor wraps it. */
export interface Paged<T> {
  data: T[];
  total: number;
  page?: number;
  limit?: number;
}

export interface PageMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// --- Community -------------------------------------------------------------

export type ModerationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface PostMedia {
  id: string;
  type: 'image' | 'video' | string;
  url: string;
  thumbnail: string | null;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
  author?: { id: string; fullName: string; avatarUrl: string | null; email?: string };
  placeId: string | null;
  regionId: string | null;
  status: ModerationStatus;
  media?: PostMedia[];
  createdAt: string;
}

// --- Itineraries -----------------------------------------------------------

export type ItineraryStatus = 'DRAFT' | 'APPLIED' | string;

export interface ItineraryStop {
  id: string;
  optionNumber: number;
  dayNumber: number;
  orderInDay: number;
  placeId: string | null;
  placeName: string;
  placeLat: number;
  placeLng: number;
  placeAddress: string | null;
  scheduledTime: string | null;
  estimatedDuration: number | null;
  estimatedCost: number | null;
  travelTimeFromPrevMin: number | null;
  stopType: 'meal' | 'visit' | string;
  mealType: string | null;
  notes: string | null;
}

export interface Itinerary {
  id: string;
  title: string | null;
  regionId: string | null;
  region?: Region | null;
  startDate: string;
  endDate: string;
  days: number;
  status: ItineraryStatus;
  selectedOption: number | null;
  estimatedCost: number | null;
  stops?: ItineraryStop[];
  createdAt: string;
}

export interface ScheduleStop {
  placeId: string;
  name: string;
  lat: number;
  lng: number;
  scheduledTime: string;
  stopType: 'meal' | 'visit';
  mealType?: string;
  estimatedDurationMin: number;
  estimatedCost: number;
  travelTimeFromPrevMin: number;
}

export interface DaySchedule {
  schedule: ScheduleStop[];
  totalStops: number;
  estimatedCost: number;
}

// --- Admin -----------------------------------------------------------------

export interface AdminUser extends User {
  deletedAt: string | null;
  suspendedAt: string | null;
  suspendReason: string | null;
}

export interface UserActionResult {
  userId: string;
  status: UserStatus;
  revokedSessions: number;
}

/** A place as it sits in the moderation queue (includes its region). */
export type PendingPlace = Place & { createdAt: string };
