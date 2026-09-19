import { useEffect, useState } from 'react';
import { useInView } from '@/hooks/useInView';

interface CountUpProps {
  end: number;
  decimals?: number;
  suffix?: string;
  durationMs?: number;
}

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Animates a number from 0 to `end` the first time it becomes visible. */
export function CountUp({ end, decimals = 0, suffix = '', durationMs = 1400 }: CountUpProps) {
  const { ref, inView } = useInView<HTMLElement>({ threshold: 0.6 });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (prefersReducedMotion()) {
      setValue(end);
      return;
    }

    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / durationMs, 1);
      const eased = 1 - (1 - progress) ** 3;
      setValue(end * eased);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frame);
  }, [inView, end, durationMs]);

  return (
    <strong ref={ref}>
      {value.toFixed(decimals)}
      {suffix}
    </strong>
  );
}
