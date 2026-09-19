export interface ImageAsset {
  src: string;
  alt: string;
  /** CSS object-position, used to choose the focal point when the image is cropped. */
  position?: string;
}

const asset = (file: string, alt: string, position = 'center'): ImageAsset => ({
  src: `${import.meta.env.BASE_URL}images/${file}`,
  alt,
  position,
});

/** Photos live in `public/images`; see `CREDITS.md` there for sources and licenses. */
export const IMAGES = {
  halongKarst: asset('halong-karst.webp', 'A cruise boat among the karsts of Ha Long Bay at dusk'),
  hanoi: asset(
    'hanoi.webp',
    'A busy street in Hanoi’s Old Quarter with scooters and shopfronts',
    '50% 55%',
  ),
  hanoiMarket: asset('hanoi-market.webp', 'An evening street market in Hanoi', '40% 50%'),
  danang: asset(
    'danang.webp',
    'The Golden Bridge held by giant stone hands near Da Nang',
    '60% 50%',
  ),
  hoian: asset('hoian.webp', 'Colorful lanterns over a lively street in Hội An', '50% 40%'),
  hoianNight: asset('hoian-night.webp', 'Hội An riverside glowing at night', '50% 60%'),
  saigon: asset(
    'saigon.webp',
    'The Ho Chi Minh City skyline reflected in the river at night',
    '60% 60%',
  ),
  pho: asset('pho.webp', 'A bowl of phở with chopsticks'),
} as const;
