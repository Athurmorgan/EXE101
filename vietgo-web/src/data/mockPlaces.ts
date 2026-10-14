import type { Place } from '@/types/api';

/**
 * Sample data shaped exactly like `GET /places` / `GET /places/:id` from the
 * `be` backend (see `types/api.ts`). `hooks/usePlaces` and `hooks/usePlace`
 * fall back to this when the API isn't reachable, so the app demos even
 * without Docker/Postgres running. Swap for the real thing automatically
 * once the backend is up — no code change needed.
 *
 * Photos reuse the Wikimedia Commons set already licensed in
 * `public/images/CREDITS.md`.
 */
const img = (file: string): string => `/images/${file}`;

export const MOCK_PLACES: Place[] = [
  {
    id: 'mock-pho-bat-dan',
    name: 'Phở Gia Truyền Bát Đàn',
    description:
      'A line out the door before 7am — three generations of the same family ladling broth that hasn’t changed since 1954. No menu, no English: queue, pay first, point at a bowl size, then find a seat wherever one opens up.',
    lat: 21.0345,
    lng: 105.8488,
    address: '49 Bát Đàn, Hoàn Kiếm, Hà Nội',
    category: 'restaurant',
    source: 'VERIFIED_LOCAL',
    status: 'APPROVED',
    isHiddenPlace: true,
    cuisineType: 'vietnamese',
    mealType: 'breakfast',
    priceRange: 'budget',
    avgMealPrice: 45000,
    googleRating: null,
    googleReviews: null,
    regionId: 'hanoi',
    region: { id: 'hanoi', name: 'Hà Nội', slug: 'ha-noi', isCity: true, lat: 21.0278, lng: 105.8342, parentId: null },
    photos: [{ id: 'p1', url: img('hanoi-market.webp'), caption: 'Old Quarter, early morning' }],
  },
  {
    id: 'mock-hoian-tailor',
    name: 'Yaly Couture — back-alley fitting room',
    description:
      'Not the storefront on the main drag — ask for the upstairs room where the head tailor takes measurements herself. 24-hour turnaround on a tailored áo dài, fittings included.',
    lat: 15.8801,
    lng: 108.338,
    address: 'Hẻm 358 Nguyễn Duy Hiệu, Hội An',
    category: 'shopping',
    source: 'USER_SUBMITTED',
    status: 'APPROVED',
    isHiddenPlace: true,
    cuisineType: null,
    mealType: null,
    priceRange: 'moderate',
    avgMealPrice: null,
    googleRating: null,
    googleReviews: null,
    regionId: 'hoian',
    region: { id: 'hoian', name: 'Hội An', slug: 'hoi-an', isCity: false, lat: 15.8801, lng: 108.338, parentId: null },
    photos: [{ id: 'p2', url: img('hoian-night.webp'), caption: 'Riverside at dusk' }],
  },
  {
    id: 'mock-danang-banh-xeo',
    name: 'Bánh Xèo Bà Dưỡng',
    description:
      'Sizzling crepes cooked table-side over charcoal, wrapped in mustard leaf with a dipping sauce the family has never written down. Locals eat here more than tourists, even now.',
    lat: 16.0544,
    lng: 108.2022,
    address: 'K280/23 Hoàng Diệu, Đà Nẵng',
    category: 'restaurant',
    source: 'VERIFIED_LOCAL',
    status: 'APPROVED',
    isHiddenPlace: false,
    cuisineType: 'vietnamese',
    mealType: 'lunch',
    priceRange: 'budget',
    avgMealPrice: 60000,
    googleRating: 4.6,
    googleReviews: 2140,
    regionId: 'danang',
    region: { id: 'danang', name: 'Đà Nẵng', slug: 'da-nang', isCity: true, lat: 16.0544, lng: 108.2022, parentId: null },
    photos: [{ id: 'p3', url: img('danang.webp'), caption: 'Near the Golden Bridge' }],
  },
  {
    id: 'mock-halong-kayak',
    name: 'Cát Bà fishing-village kayak route',
    description:
      'Paddle out from the floating village at sunrise, before the day-trip boats arrive — a quiet route through limestone karsts that most cruise itineraries skip entirely.',
    lat: 20.9101,
    lng: 107.0486,
    address: 'Cái Bèo floating village, Cát Bà',
    category: 'attraction',
    source: 'VERIFIED_LOCAL',
    status: 'APPROVED',
    isHiddenPlace: true,
    cuisineType: null,
    mealType: null,
    priceRange: 'moderate',
    avgMealPrice: null,
    googleRating: null,
    googleReviews: null,
    regionId: 'halong',
    region: { id: 'halong', name: 'Hạ Long', slug: 'ha-long', isCity: false, lat: 20.9101, lng: 107.0486, parentId: null },
    photos: [{ id: 'p4', url: img('halong-karst.webp'), caption: 'Dawn among the karsts' }],
  },
  {
    id: 'mock-saigon-rooftop',
    name: 'Chợ Cũ night-market noodle stalls',
    description:
      'A strip of plastic stools that only comes alive after 9pm, long after the day market packs up. Ask for the stall with the longest queue — it changes by season.',
    lat: 10.7725,
    lng: 106.6986,
    address: 'Chợ Cũ, Quận 1, TP. Hồ Chí Minh',
    category: 'restaurant',
    source: 'USER_SUBMITTED',
    status: 'APPROVED',
    isHiddenPlace: true,
    cuisineType: 'vietnamese',
    mealType: 'dinner',
    priceRange: 'budget',
    avgMealPrice: 35000,
    googleRating: null,
    googleReviews: null,
    regionId: 'saigon',
    region: { id: 'saigon', name: 'TP. Hồ Chí Minh', slug: 'tp-ho-chi-minh', isCity: true, lat: 10.7725, lng: 106.6986, parentId: null },
    photos: [{ id: 'p5', url: img('saigon.webp'), caption: 'Skyline from the river' }],
  },
  {
    id: 'mock-hanoi-egg-coffee',
    name: 'Cafe Đinh — unmarked staircase',
    description:
      'Three flights up an alley staircase with no sign, overlooking Hoàn Kiếm Lake. The egg coffee recipe predates the lake-view cafes that now charge double for the same view.',
    lat: 21.0287,
    lng: 105.8521,
    address: '13 Đinh Tiên Hoàng, Hoàn Kiếm, Hà Nội',
    category: 'cafe',
    source: 'VERIFIED_LOCAL',
    status: 'APPROVED',
    isHiddenPlace: false,
    cuisineType: null,
    mealType: 'coffee',
    priceRange: 'budget',
    avgMealPrice: 30000,
    googleRating: 4.5,
    googleReviews: 1890,
    regionId: 'hanoi',
    region: { id: 'hanoi', name: 'Hà Nội', slug: 'ha-noi', isCity: true, lat: 21.0278, lng: 105.8342, parentId: null },
    photos: [{ id: 'p6', url: img('hanoi.webp'), caption: 'Old Quarter rooftops' }],
  },
];

export function findMockPlace(id: string): Place | undefined {
  return MOCK_PLACES.find((place) => place.id === id);
}
