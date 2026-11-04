import type { ReactNode } from 'react';
import { cx } from '@/utils/cx';
import { Eyebrow, type EyebrowTone } from '@/components/ui/Eyebrow';
import { Lead, type LeadTone } from '@/components/ui/Lead';
import { useInView } from '@/hooks/useInView';
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

/**
 * Eyebrow, title and lead arrive one after another when the header is first seen; the title rises
 * out of a mask like an engraved plate being uncovered.
 */
export function SectionHeader({
  eyebrow,
  eyebrowTone = 'red',
  title,
  lead,
  leadTone = 'muted',
  split = false,
}: SectionHeaderProps) {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.3 });

  return (
    <div ref={ref} className={cx(styles.header, split && styles.split, inView && styles.visible)}>
      <div>
        <Eyebrow tone={eyebrowTone} className={styles.fade}>
          {eyebrow}
        </Eyebrow>
        <h2 className={styles.title}>{title}</h2>
        {!split && lead && (
          <Lead tone={leadTone} className={cx(styles.fade, styles.late)}>
            {lead}
          </Lead>
        )}
      </div>
      {split && lead && (
        <Lead tone={leadTone} className={cx(styles.fade, styles.late)}>
          {lead}
        </Lead>
      )}
    </div>
  );
}
