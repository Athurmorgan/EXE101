import type { ImageAsset } from '@/data/images';

export interface Slide {
  /** Caption shown in the slide indicator. */
  place: string;
  image: ImageAsset;
  /** `srcset` with a 1920px and a 3840px (4K) version of the photo. */
  srcSet: string;
}

/** Time each photo stays on screen. */
export const SLIDE_INTERVAL_MS = 2000;

/** Slot sizes the browser picks from; the photo always fills the viewport width. */
export const SLIDE_SIZES = '100vw';

const slide = (file: string, place: string, alt: string, position = 'center'): Slide => {
  const base = `${import.meta.env.BASE_URL}images/${file}`;
  return {
    place,
    image: { src: `${base}-1920.webp`, alt, position },
    srcSet: `${base}-1920.webp 1920w, ${base}-3840.webp 3840w`,
  };
};

export const SLIDES: readonly Slide[] = [
  slide(
    'slide-halong-cruise',
    'Hạ Long Bay',
    'Cruise ships among the limestone islands of Ha Long Bay',
    '50% 55%',
  ),
  slide(
    'slide-halong-sunset',
    'Hạ Long at sunset',
    'Sun setting behind the karsts of Ha Long Bay',
    '50% 60%',
  ),
  slide(
    'slide-halong-titop',
    'Ti Tốp Island',
    'Green islands and boats seen from the Ti Tốp viewpoint',
    '50% 50%',
  ),
  slide('slide-sapa', 'Sapa', 'Sunbeams over the terraced rice fields of Sapa'),
  slide('slide-hoian', 'Hội An', 'Lanterns lighting a street in Hội An at dusk', '50% 40%'),
  slide(
    'slide-danang',
    'Đà Nẵng',
    'The Golden Bridge held by giant stone hands near Da Nang',
    '60% 50%',
  ),
];

/** Downloads every slide except the first (already on screen) so later transitions never flash. */
export function preloadSlides(slides: readonly Slide[]): Promise<unknown> {
  return Promise.allSettled(
    slides.slice(1).map(
      ({ image, srcSet }) =>
        new Promise<void>((resolve) => {
          const img = new window.Image();
          img.sizes = SLIDE_SIZES;
          img.srcset = srcSet;
          img.src = image.src;
          img.onload = () => resolve();
          img.onerror = () => resolve();
        }),
    ),
  );
}
