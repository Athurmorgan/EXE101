import type { Ref } from 'react';
import type { ImageAsset } from '@/data/images';
import { cx } from '@/utils/cx';
import styles from './Image.module.css';

interface ImageProps {
  image: ImageAsset;
  /** Above-the-fold image: loads eagerly with high priority instead of lazily. */
  priority?: boolean;
  /** Purely visual (backgrounds): hidden from assistive technology. */
  decorative?: boolean;
  /** Responsive candidates, e.g. `"/a-1920.webp 1920w, /a-3840.webp 3840w"`. */
  srcSet?: string;
  sizes?: string;
  className?: string;
  ref?: Ref<HTMLImageElement>;
}

/** Cover-fit photo with sensible loading defaults. */
export function Image({
  image,
  priority = false,
  decorative = false,
  srcSet,
  sizes,
  className,
  ref,
}: ImageProps) {
  return (
    <img
      ref={ref}
      className={cx(styles.image, className)}
      src={image.src}
      srcSet={srcSet}
      sizes={sizes}
      alt={decorative ? '' : image.alt}
      aria-hidden={decorative || undefined}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      decoding="async"
      draggable={false}
      style={{ objectPosition: image.position }}
    />
  );
}
