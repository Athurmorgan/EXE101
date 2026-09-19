import type { IconName } from '@/components/ui/Icon';
import { IMAGES, type ImageAsset } from '@/data/images';

export interface Service {
  title: string;
  description: string;
  icon: IconName;
  image: ImageAsset;
}

export const SERVICES: readonly Service[] = [
  {
    title: 'Connect',
    description: 'Stories, circles and communities that feel close.',
    icon: 'chat',
    image: IMAGES.hoian,
  },
  {
    title: 'Stay',
    description: 'Hotels and homestays, booked in a few taps.',
    icon: 'bed',
    image: IMAGES.hoianNight,
  },
  {
    title: 'Navigate',
    description: "Live directions made for Vietnam's streets.",
    icon: 'compass',
    image: IMAGES.hanoi,
  },
  {
    title: 'Eat',
    description: 'Local favorites delivered or discovered nearby.',
    icon: 'eat',
    image: IMAGES.pho,
  },
  {
    title: 'Move',
    description: 'Rides, transit and intercity trips in one place.',
    icon: 'move',
    image: IMAGES.hanoiMarket,
  },
  {
    title: 'Experience',
    description: 'Music, culture and neighborhood happenings.',
    icon: 'ticket',
    image: IMAGES.danang,
  },
  {
    title: 'Pay',
    description: 'Fast, protected payments across every service.',
    icon: 'wallet',
    image: IMAGES.saigon,
  },
  {
    title: 'Discover',
    description: 'Places worth knowing, curated by locals.',
    icon: 'search',
    image: IMAGES.halongKarst,
  },
];
