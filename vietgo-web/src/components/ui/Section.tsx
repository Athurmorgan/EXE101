import type { ReactNode } from 'react';
import { cx } from '@/utils/cx';
import { Container } from './Container';
import styles from './Section.module.css';

interface SectionProps {
  id?: string;
  tone?: 'cream' | 'dark' | 'forest';
  /** Decorative layer rendered behind the content (e.g. a photo). It should fill the section. */
  backdrop?: ReactNode;
  children: ReactNode;
}

/** Full-width page band with a themed background and a centered container. */
export function Section({ id, tone = 'cream', backdrop, children }: SectionProps) {
  return (
    <section id={id} className={cx(styles.section, styles[tone])}>
      {backdrop}
      <Container className={styles.content}>{children}</Container>
    </section>
  );
}
