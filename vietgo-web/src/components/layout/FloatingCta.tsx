import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useScrolledPast } from '@/hooks/useScrolledPast';
import { cx } from '@/utils/cx';
import styles from './FloatingCta.module.css';

const pastHero = () => window.innerHeight * 1.2;

/**
 * Two pills pinned to the bottom-right corner, as on the reference: they slide in once the hero is
 * behind and step aside while the closing call to action (`#app`) is on screen.
 */
export function FloatingCta() {
  const past = useScrolledPast(pastHero);
  const [ctaVisible, setCtaVisible] = useState(false);

  useEffect(() => {
    const target = document.getElementById('app');
    if (!target || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(([entry]) =>
      setCtaVisible(Boolean(entry?.isIntersecting)),
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  const shown = past && !ctaVisible;

  return (
    <div className={cx(styles.floating, shown && styles.shown)} inert={!shown}>
      <Button href="/app/trips/new" variant="outline" size="sm" className={styles.secondary}>
        Plan a trip
      </Button>
      <Button href="/app/discover" variant="gold" size="sm" withArrow>
        Open the app
      </Button>
    </div>
  );
}
