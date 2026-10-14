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
├── components/     Shared building blocks, no page-specific content
│   ├── ui/         Small primitives: Button, Icon, Image, Eyebrow, Lead, ScrollCarousel, ...
│   ├── layout/     Page structure: Header, Footer, Logo, Section, Container, StackedSection, ...
│   └── motion/     Animation wrappers: Reveal, TextReveal, ScrubText, ParallaxLayer, CurtainReveal, ...
├── sections/       Landing-page sections, one folder each (component + styles + data)
├── pages/          Pages: which sections appear, in what order (HomePage)
├── data/           Content shared by several sections, e.g. the image catalogue
├── hooks/          Reusable hooks (useInView, useDragScroll, ...)
├── lib/            Third-party setup, e.g. GSAP plugins and shared media queries
├── providers/      App-wide providers, e.g. smooth scrolling
├── styles/         Global CSS: design tokens and base styles
├── utils/          Small pure helpers
├── App.tsx         Site shell: header, page area, footer
└── main.tsx        Entry point
```

Dependencies only point downwards: `pages` -> `sections` -> `components` -> `hooks` / `lib` /
`utils`. Components never import from `sections`, and sections never import from each other.

## Adding new functionality

- **A new page:** create `src/pages/XPage.tsx` that composes sections, then render it inside
  `<main>` in `App.tsx` (put a router around it when there is more than one page).
- **A new landing section:** create `src/sections/X/` with `X.tsx`, `X.module.css` and a plain
  `.ts` data file for its copy, then add it to `HomePage.tsx`.
- **A feature with its own logic** (forms, login, API calls, dashboards): create
  `src/features/<name>/` holding its `components/`, `hooks/`, `api/` and `types.ts`, and let
  pages or sections import from it. Keep anything reusable across features in `components/`,
  `hooks/` or `utils/` instead.
- **A reusable piece:** small and generic -> `components/ui`; page structure ->
  `components/layout`; animation -> `components/motion`.

## Conventions

- **Styling:** CSS Modules next to each component (`Component.module.css`). Colors and
  sizes come from the CSS variables in `src/styles/global.css`; do not hard-code them.
- **Imports:** use the `@/` alias for anything under `src/`.
- **Content vs. UI:** section copy lives in plain `.ts` data files (`services.ts`,
  `destinations.ts`, `moments.ts`, ...) with no JSX, so text can change without touching markup.
  Use `<Lines lines={[...]} />` when a heading needs line breaks.
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
