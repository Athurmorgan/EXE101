import type { ReactNode } from 'react';
import { cx } from '@/utils/cx';
import styles from './Lead.module.css';

export type LeadTone = 'muted' | 'green' | 'light';

interface LeadProps {
  children: ReactNode;
  tone?: LeadTone;
}

/** Larger supporting paragraph shown under a heading. */
export function Lead({ children, tone = 'muted' }: LeadProps) {
  return <p className={cx(styles.lead, styles[tone])}>{children}</p>;
}
