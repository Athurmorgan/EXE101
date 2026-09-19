export interface NavLink {
  label: string;
  href: string;
}

export const NAV_LINKS: readonly NavLink[] = [
  { label: 'Explore', href: '#explore' },
  { label: 'Journeys', href: '#journey' },
  { label: 'Destinations', href: '#places' },
  { label: 'Safety', href: '#trust' },
];

export const FOOTER_LINKS: readonly NavLink[] = [
  { label: 'About', href: '#' },
  { label: 'Careers', href: '#' },
  { label: 'Partners', href: '#' },
  { label: 'Privacy', href: '#' },
  { label: 'Help', href: '#' },
];
