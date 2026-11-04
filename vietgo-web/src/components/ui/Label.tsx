import type { ReactNode } from 'react';
import { cx } from '@/utils/cx';
import styles from './Label.module.css';

/** Small uppercase section label in round brackets: `( Made for real days )`. */
export function Label({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cx(styles.label, className)}>( {children} )</p>;
}
