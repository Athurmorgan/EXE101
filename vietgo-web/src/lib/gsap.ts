import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger, useGSAP);

/** Media query used to skip scroll-driven animation for users who prefer reduced motion. */
export const MOTION_OK = '(prefers-reduced-motion: no-preference)';

/** Breakpoint above which the wide, pinned layouts are used. */
export const DESKTOP = '(min-width: 961px)';

export { gsap, ScrollTrigger, useGSAP };
