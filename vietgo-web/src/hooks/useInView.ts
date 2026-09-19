import { useEffect, useRef, useState } from 'react';

interface UseInViewOptions {
  /** Portion of the element (0–1) that must be visible to trigger. */
  threshold?: number;
}

/**
 * Reports whether an element has entered the viewport.
 * Fires once: after the element is seen, observation stops and `inView` stays true.
 */
export function useInView<T extends Element>({ threshold = 0.12 }: UseInViewOptions = {}) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (!('IntersectionObserver' in window)) {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold },
    );
    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold]);

  return { ref, inView } as const;
}
