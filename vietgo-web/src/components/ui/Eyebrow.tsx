import type { ReactNode } from 'react';
import { cx } from '@/utils/cx';
import styles from './Eyebrow.module.css';

export type EyebrowTone = 'red' | 'mint' | 'light';

interface EyebrowProps {
  children: ReactNode;
  tone?: EyebrowTone;
  className?: string;
}

/** Small uppercase label that sits above a heading. */
export function Eyebrow({ children, tone = 'red', className }: EyebrowProps) {
  return <p className={cx(styles.eyebrow, styles[tone], className)}>{children}</p>;
}
