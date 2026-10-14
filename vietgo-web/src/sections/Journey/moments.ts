import { IMAGES, type ImageAsset } from '@/data/images';

/** Which illustrative app screen a moment shows (see `Mocks.tsx`). */
export type MockKind = 'feed' | 'plan';

export interface Moment {
  time: string;
  /** Heading split into visual lines. */
  titleLines: readonly string[];
  description: string;
  mock: MockKind;
  /** Full-bleed photo shown behind the scene. */
  image: ImageAsset;
}

export const MOMENTS: readonly Moment[] = [
  {
    time: '08:10 · Hà Nội',
    titleLines: ['Find what the city is', 'talking about.'],
    description:
      'Follow local creators, save a hidden courtyard café, invite your circle—and navigate there without changing apps.',
    mock: 'feed',
    image: IMAGES.hanoi,
  },
  {
    time: '19:40 · Hồ Chí Minh City',
    titleLines: ['Dinner, tickets and a', 'ride—already in sync.'],
    description:
      'Reserve the table, split the payment and book your ride to a live show. Every step shares the same trusted profile.',
    mock: 'plan',
    image: IMAGES.saigon,
  },
];
