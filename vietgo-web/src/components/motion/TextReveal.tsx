import type { ElementType } from 'react';
import { useInView } from '@/hooks/useInView';
import { cx } from '@/utils/cx';
import styles from './TextReveal.module.css';

interface TextRevealProps {
  as?: ElementType;
  /** Each entry is one visual line, revealed one after another. */
  lines: readonly string[];
  /**
   * `slide`: lines rise out of a mask.
   * `ink`: lines are wiped in from left to right with a soft edge, like a brush stroke.
   */
  variant?: 'slide' | 'ink';
  /** Delay in ms before the first line starts. */
  delay?: number;
  className?: string;
}

const LINE_STAGGER_MS = 90;
const INK_LINE_STAGGER_MS = 260;

export function TextReveal({
  as: Tag = 'div',
  lines,
  variant = 'slide',
  delay = 0,
  className,
}: TextRevealProps) {
  const { ref, inView } = useInView<HTMLElement>({ threshold: 0.3 });
  const stagger = variant === 'ink' ? INK_LINE_STAGGER_MS : LINE_STAGGER_MS;

  return (
    <Tag
      ref={ref}
      className={cx(styles.root, styles[variant], inView && styles.visible, className)}
    >
      {lines.map((line, index) => (
        <span key={line} className={styles.line}>
          <span
            className={styles.inner}
            style={{ transitionDelay: `${delay + index * stagger}ms` }}
          >
            {line}
          </span>
        </span>
      ))}
    </Tag>
  );
}
