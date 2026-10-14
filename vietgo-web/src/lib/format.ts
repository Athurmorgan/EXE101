/** Display helpers shared by the app pages — keep raw API values out of JSX. */

const CATEGORY_LABELS: Record<string, string> = {
  restaurant: 'Restaurant',
  cafe: 'Café',
  attraction: 'Attraction',
  hotel: 'Stay',
  shopping: 'Shopping',
};

const PRICE_LABELS: Record<string, string> = {
  budget: 'Budget',
  moderate: 'Mid-range',
  'high-end': 'High-end',
};

const MEAL_LABELS: Record<string, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  coffee: 'Coffee',
  'all-day': 'All day',
};

export const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function categoryLabel(category: string): string {
  return CATEGORY_LABELS[category] ?? capitalize(category);
}

export function priceLabel(priceRange: string): string {
  return PRICE_LABELS[priceRange] ?? capitalize(priceRange);
}

export function mealLabel(mealType: string): string {
  return MEAL_LABELS[mealType] ?? capitalize(mealType);
}

export function formatVnd(amount: number): string {
  return `${amount.toLocaleString('vi-VN')}₫`;
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.charAt(0) ?? '';
  const last = parts.length > 1 ? (parts[parts.length - 1]?.charAt(0) ?? '') : '';
  return (first + last).toUpperCase() || '?';
}

export function formatDate(value: string | Date, options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' }): string {
  return new Date(value).toLocaleDateString('en-GB', options);
}

const UNITS: Array<[Intl.RelativeTimeFormatUnit, number]> = [
  ['year', 31_536_000],
  ['month', 2_592_000],
  ['week', 604_800],
  ['day', 86_400],
  ['hour', 3_600],
  ['minute', 60],
];

/** "3 days ago" — falls back to "just now" under a minute. */
export function timeAgo(value: string | Date): string {
  const seconds = (Date.now() - new Date(value).getTime()) / 1000;
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  for (const [unit, size] of UNITS) {
    if (seconds >= size) return rtf.format(-Math.floor(seconds / size), unit);
  }
  return 'just now';
}

/** Local calendar date as `YYYY-MM-DD` (what `<input type="date">` and the BE expect). */
export function isoDate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function mapsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}
