import type { CSSProperties, ReactNode } from 'react';
import { useInView } from '@/hooks/useInView';
import { cx } from '@/utils/cx';
import styles from './RuledList.module.css';

interface RuledListProps {
  /** One entry per row; the list is static copy, so rows are keyed by position. */
  items: readonly ReactNode[];
  /** Delay between rows, in ms. */
  stagger?: number;
  className?: string;
  itemClassName?: string;
}

/**
 * A list with a hairline above each row. When it scrolls into view the hairlines draw in from the
 * left one after another and each row's content rises in behind its line.
 */
export function RuledList({ items, stagger = 90, className, itemClassName }: RuledListProps) {
  const { ref, inView } = useInView<HTMLUListElement>({ threshold: 0.2 });

  return (
    <ul ref={ref} className={cx(styles.list, inView && styles.visible, className)}>
      {items.map((item, index) => (
        <li
          key={index}
          className={cx(styles.row, itemClassName)}
          style={{ '--delay': `${index * stagger}ms` } as CSSProperties}
        >
          <div className={styles.content}>{item}</div>
        </li>
      ))}
    </ul>
  );
}
