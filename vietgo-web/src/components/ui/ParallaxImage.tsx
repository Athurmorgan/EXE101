import type { ImageAsset } from '@/data/images';
import { Image } from './Image';
import { ParallaxLayer } from './ParallaxLayer';

interface ParallaxImageProps {
  image: ImageAsset;
  speed?: number;
  priority?: boolean;
  className?: string;
}

/** Photo that drifts slower than the page while scrolling. */
export function ParallaxImage({ image, speed, priority = false, className }: ParallaxImageProps) {
  return (
    <ParallaxLayer speed={speed} className={className}>
      <Image image={image} priority={priority} decorative />
    </ParallaxLayer>
  );
}
