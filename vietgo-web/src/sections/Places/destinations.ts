import { IMAGES, type ImageAsset } from '@/data/images';

export interface Destination {
  name: string;
  tagline: string;
  description: string;
  image: ImageAsset;
}

export const DESTINATIONS: readonly Destination[] = [
  {
    name: 'Hà Nội',
    tagline: 'Heritage, remixed',
    description:
      'Egg coffee in a courtyard, a walk through the Old Quarter, a night market after dark.',
    image: IMAGES.hanoi,
  },
  {
    name: 'Hạ Long',
    tagline: 'Where the sea keeps its secrets',
    description: 'Overnight cruises and quiet kayak routes between a thousand limestone islands.',
    image: IMAGES.halongKarst,
  },
  {
    name: 'Đà Nẵng',
    tagline: 'Coast meets city',
    description: 'Beaches, bridges and the hills of Bà Nà, all a short ride apart.',
    image: IMAGES.danang,
  },
  {
    name: 'Hội An',
    tagline: 'After the lanterns glow',
    description: 'Tailors, riverside dinners and streets lit by paper lanterns.',
    image: IMAGES.hoian,
  },
  {
    name: 'Sài Gòn',
    tagline: 'Never quite asleep',
    description: 'Rooftop views, late-night noodles and a skyline that keeps changing.',
    image: IMAGES.saigon,
  },
];
