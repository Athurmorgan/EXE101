import type { ElementType, ReactNode } from 'react';
import { useInView } from '@/hooks/useInView';
import { usePageReady } from '@/hooks/usePageReady';
import { cx } from '@/utils/cx';
import styles from './TextReveal.module.css';

interface TextRevealProps {
  as?: ElementType;
  /** Each entry is one visual line, revealed one after another. */
  lines: readonly ReactNode[];
  /**
   * `slide`: lines rise out of a mask.
   * `ink`: lines are wiped in from left to right with a soft edge, like a brush stroke.
   */
  variant?: 'slide' | 'ink';
  /** Delay in ms before the first line starts. */
  delay?: number;
  /** Holds the reveal until the preloader has lifted (for the hero). */
  waitForReady?: boolean;
  /** Extra class per line, e.g. to offset lines on a grid. */
  lineClassName?: (index: number) => string | undefined;
  className?: string;
}

const LINE_STAGGER_MS = 90;
const INK_LINE_STAGGER_MS = 260;

export function TextReveal({
  as: Tag = 'div',
  lines,
  variant = 'slide',
  delay = 0,
  waitForReady = false,
  lineClassName,
  className,
}: TextRevealProps) {
  const { ref, inView } = useInView<HTMLElement>({ threshold: 0.3 });
  const pageReady = usePageReady();
  const visible = inView && (pageReady || !waitForReady);
  const stagger = variant === 'ink' ? INK_LINE_STAGGER_MS : LINE_STAGGER_MS;

  return (
    <Tag
      ref={ref}
      className={cx(styles.root, styles[variant], visible && styles.visible, className)}
    >
      {lines.map((line, index) => (
        // Lines are static copy, so their position is a stable key.
        <span key={index} className={cx(styles.line, lineClassName?.(index))}>
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
