import type { CSSProperties } from 'react';
import { Image } from '@/components/ui/Image';
import { cx } from '@/utils/cx';
import styles from './HeroSlideshow.module.css';
import { SLIDE_SIZES, SLIDES } from './slides';

/** Where each incoming photo's ink blot starts spreading from (x y, as % of the frame). */
const INK_ORIGINS = ['22% 68%', '80% 40%', '46% 28%', '86% 78%', '30% 24%', '62% 82%'] as const;

interface HeroSlideshowProps {
  /** Index of the photo currently on top. */
  activeIndex: number;
  /** Index of the photo being covered, or null before the first change. */
  previousIndex: number | null;
  /** Photos after the first are only mounted once they are cached. */
  ready: boolean;
}

/**
 * Stack of full-bleed photos. Each new photo spreads over the old one like a drop of ink;
 * the active photo also zooms out slowly.
 */
export function HeroSlideshow({ activeIndex, previousIndex, ready }: HeroSlideshowProps) {
  return (
    <div className={styles.stack}>
      {SLIDES.map(({ image, srcSet }, index) => {
        if (index > 0 && !ready) return null;
        const active = index === activeIndex;
        const [inkX, inkY] = INK_ORIGINS[index % INK_ORIGINS.length]?.split(' ') ?? [];

        return (
          <div
            key={srcSet}
            className={cx(
              styles.slide,
              active && styles.active,
              // The very first photo appears normally; only later ones bleed in.
              active && previousIndex !== null && styles.ink,
              index === previousIndex && styles.previous,
            )}
            style={{ '--ink-x': inkX, '--ink-y': inkY } as CSSProperties}
          >
            <Image
              image={image}
              srcSet={srcSet}
              sizes={SLIDE_SIZES}
              priority={index === 0}
              decorative={!active}
            />
          </div>
        );
      })}
    </div>
  );
}
