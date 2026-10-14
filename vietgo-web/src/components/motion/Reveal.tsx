import type { ElementType, ReactNode } from 'react';
import { useInView } from '@/hooks/useInView';
import { cx } from '@/utils/cx';
import styles from './Reveal.module.css';

interface RevealProps {
  /** Element to render. Defaults to a div. */
  as?: ElementType;
  /** Transition delay in ms, handy for staggering siblings. */
  delay?: number;
  className?: string;
  children: ReactNode;
}

/** Fades and slides its content in the first time it scrolls into view. */
export function Reveal({ as: Tag = 'div', delay = 0, className, children }: RevealProps) {
  const { ref, inView } = useInView<HTMLElement>();

  return (
    <Tag
      ref={ref}
      className={cx(styles.reveal, inView && styles.visible, className)}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
