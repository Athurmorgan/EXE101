import type { ReactNode } from 'react';
import { cx } from '@/utils/cx';
import { Eyebrow, type EyebrowTone } from './Eyebrow';
import { Lead, type LeadTone } from './Lead';
import { Reveal } from './Reveal';
import styles from './SectionHeader.module.css';

interface SectionHeaderProps {
  eyebrow: string;
  eyebrowTone?: EyebrowTone;
  title: ReactNode;
  lead?: string;
  leadTone?: LeadTone;
  /** Places the lead paragraph to the right of the title on wide screens. */
  split?: boolean;
}

export function SectionHeader({
  eyebrow,
  eyebrowTone = 'red',
  title,
  lead,
  leadTone = 'muted',
  split = false,
}: SectionHeaderProps) {
  return (
    <Reveal className={cx(split && styles.split)}>
      <div>
        <Eyebrow tone={eyebrowTone}>{eyebrow}</Eyebrow>
        <h2>{title}</h2>
        {!split && lead && <Lead tone={leadTone}>{lead}</Lead>}
      </div>
      {split && lead && <Lead tone={leadTone}>{lead}</Lead>}
    </Reveal>
  );
}
