import { useRef } from 'react';
import { gsap, MOTION_OK, useGSAP } from '@/lib/gsap';
import { cx } from '@/utils/cx';
import styles from './ScrubText.module.css';

interface ScrubTextProps {
  text: string;
  className?: string;
}

/** Paragraph whose words light up one by one as it scrolls through the viewport. */
export function ScrubText({ text, className }: ScrubTextProps) {
  const ref = useRef<HTMLParagraphElement>(null);

  useGSAP(
    () => {
      const element = ref.current;
      if (!element) return;

      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.fromTo(
          element.querySelectorAll('span'),
          { opacity: 0.16 },
          {
            opacity: 1,
            ease: 'none',
            stagger: 0.1,
            scrollTrigger: { trigger: element, start: 'top 82%', end: 'bottom 50%', scrub: true },
          },
        );
      });

      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <p ref={ref} className={cx(styles.text, className)}>
      {text.split(' ').map((word, index) => (
        <span key={`${word}-${index}`}>{word} </span>
      ))}
    </p>
  );
}
