import type { ReactNode } from 'react';
import { IMAGES, type ImageAsset } from '@/data/images';
import { FeedMock, PlanMock } from './Mocks';

export interface Moment {
  time: string;
  title: ReactNode;
  description: string;
  mock: ReactNode;
  /** Full-bleed photo shown behind the scene. */
  image: ImageAsset;
}

export const MOMENTS: readonly Moment[] = [
  {
    time: '08:10 · Hà Nội',
    title: (
      <>
        Find what the city is
        <br />
        talking about.
      </>
    ),
    description:
      'Follow local creators, save a hidden courtyard café, invite your circle—and navigate there without changing apps.',
    mock: <FeedMock />,
    image: IMAGES.hanoi,
  },
  {
    time: '19:40 · Hồ Chí Minh City',
    title: (
      <>
        Dinner, tickets and a
        <br />
        ride—already in sync.
      </>
    ),
    description:
      'Reserve the table, split the payment and book your ride to a live show. Every step shares the same trusted profile.',
    mock: <PlanMock />,
    image: IMAGES.saigon,
  },
];
