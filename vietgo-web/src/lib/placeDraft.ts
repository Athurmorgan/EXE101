import type { NewPlacePayload } from './api/places';
import type { FieldErrors } from './validation';

/** The "suggest a place" form as the user types it (all strings), plus its rules. */

/** Enum values accepted by the BE's CreatePlaceDto. */
export const PLACE_CATEGORIES = ['restaurant', 'cafe', 'attraction', 'hotel', 'shopping'];
export const CUISINES = ['vietnamese', 'bbq', 'seafood', 'vegetarian', 'international', 'dessert', 'street-food'];
export const MEALS = ['breakfast', 'lunch', 'dinner', 'coffee', 'all-day'];
export const PRICES = ['budget', 'moderate', 'high-end'];

export const EMPTY_PLACE_DRAFT = {
  name: '',
  category: 'restaurant',
  address: '',
  regionId: '',
  lat: '',
  lng: '',
  description: '',
  cuisineType: '',
  mealType: '',
  priceRange: '',
  avgMealPrice: '',
  isHiddenPlace: false,
};

export type PlaceDraft = typeof EMPTY_PLACE_DRAFT;

export function isFoodPlace(draft: PlaceDraft): boolean {
  return draft.category === 'restaurant' || draft.category === 'cafe';
}

export function validatePlaceDraft(draft: PlaceDraft): FieldErrors {
  const lat = Number(draft.lat);
  const lng = Number(draft.lng);
  const errors: FieldErrors = {};
  if (draft.name.trim().length < 2) errors.name = 'Give it a name (2+ characters).';
  if (draft.lat === '' || !Number.isFinite(lat) || Math.abs(lat) > 90) errors.lat = 'Latitude between -90 and 90.';
  if (draft.lng === '' || !Number.isFinite(lng) || Math.abs(lng) > 180) errors.lng = 'Longitude between -180 and 180.';
  if (draft.avgMealPrice && !(Number(draft.avgMealPrice) >= 0)) errors.avgMealPrice = 'A positive amount in VND.';
  return errors;
}

/** Assumes `validatePlaceDraft` passed. Food-only fields are dropped for other categories. */
export function toPlacePayload(draft: PlaceDraft): NewPlacePayload {
  return {
    name: draft.name.trim(),
    category: draft.category,
    lat: Number(draft.lat),
    lng: Number(draft.lng),
    address: draft.address.trim() || undefined,
    regionId: draft.regionId || undefined,
    description: draft.description.trim() || undefined,
    isHiddenPlace: draft.isHiddenPlace,
    ...(isFoodPlace(draft) && {
      cuisineType: draft.cuisineType || undefined,
      mealType: draft.mealType || undefined,
      priceRange: draft.priceRange || undefined,
      avgMealPrice: draft.avgMealPrice ? Math.round(Number(draft.avgMealPrice)) : undefined,
    }),
  };
}
