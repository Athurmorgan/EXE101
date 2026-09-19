# VietGo Web

Landing page for VietGo, built with React 19, TypeScript and Vite. Motion is handled by
[Lenis](https://lenis.darkroom.engineering) (smooth scrolling) and [GSAP](https://gsap.com)
ScrollTrigger (parallax, pinning, scrubbed text).

## Getting started

```bash
npm install
npm run dev        # start the dev server
```

| Script              | What it does                      |
| ------------------- | --------------------------------- |
| `npm run dev`       | Start the Vite dev server         |
| `npm run build`     | Type-check, then build to `dist/` |
| `npm run preview`   | Preview the production build      |
| `npm run typecheck` | Run the TypeScript compiler only  |
| `npm run lint`      | Lint with ESLint                  |
| `npm run format`    | Format all files with Prettier    |

## Project structure

```
public/images/      Optimized WebP photos + CREDITS.md (sources and licenses)
src/
├── components/
│   ├── layout/     Header, Footer, Logo, ScrollProgress, navigation data
│   └── ui/         Reusable blocks (Button, Section, Image, ParallaxImage,
│                   TextReveal, ScrubText, ScrollCarousel, StackedSection, ...)
├── data/           Shared content, e.g. the image catalogue (images.ts)
├── hooks/          Reusable hooks (useInView, useDragScroll)
├── lib/            GSAP setup and shared media queries
├── providers/      SmoothScroll (Lenis <-> ScrollTrigger)
├── sections/       One folder per page section (component + styles + data)
├── styles/         Global CSS: design tokens and base styles
├── utils/          Small helpers
├── App.tsx         Page composition
└── main.tsx        Entry point
```

## Conventions

- **Styling:** CSS Modules next to each component (`Component.module.css`). Colors and
  sizes come from the CSS variables in `src/styles/global.css`; do not hard-code them.
- **Imports:** use the `@/` alias for anything under `src/`.
- **Content vs. UI:** section copy lives in data files (`services.ts`, `destinations.ts`, ...)
  so text can change without touching markup.
- **Images:** add files to `public/images`, register them in `src/data/images.ts` with
  meaningful `alt` text, and add the credit to `public/images/CREDITS.md`.
- **Motion:** always import GSAP from `@/lib/gsap` (it registers the plugins), and wrap
  scroll animations in `gsap.matchMedia()` using `MOTION_OK` so users who prefer reduced
  motion get a static page. Only animate `transform` and `opacity`.
- **Before committing:** run `npm run lint` and `npm run typecheck`.

## TODO

- Swap the Wikimedia Commons photos for branded photography if available (change files in
  `public/images`; keep the same names or update `src/data/images.ts`).
- Point the store buttons in `sections/Hero` and `sections/Cta` at the real App Store / Google Play URLs.

## Notes on the hero and section stacking

- **Hero slideshow** (`src/sections/Hero`): photos and captions live in `slides.ts`; the interval is
  `SLIDE_INTERVAL_MS`. Each photo needs a `-1920.webp` and a `-3840.webp` file in `public/images`.
  Only the first photo loads up front; the rest are cached when the browser is idle.
- **Brush title:** the hero heading uses `--font-brush` (Yuji Boku), which has Latin letters only.
  Do not put Vietnamese diacritics in text that uses it.
- **Stacked sections** (`StackedSection`, used in `App.tsx`): sections pile up on screens wider than
  960px when motion is allowed. Put in-page anchor ids on the wrapper (`id` prop), not on the
  section inside, so links still work while a panel is covered.

## Effects added on top

- **Ink-bleed slide transition** (`HeroSlideshow.module.css`): each new hero photo is revealed through
  a rough-edged ink-blot mask that grows from a point (`INK_ORIGINS` in `HeroSlideshow.tsx`).
- **Curtain reveal** (`CurtainReveal.tsx`): wrap a photo to have it open from the bottom, with a slight
  zoom-out, the first time it scrolls into view.
