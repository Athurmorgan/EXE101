import type { ReactNode } from 'react';
import { Container } from './Container';
import styles from './Section.module.css';

interface SectionProps {
  id?: string;
  children: ReactNode;
}

/** Full-width page band with a centred container on the page's cream background. */
export function Section({ id, children }: SectionProps) {
  return (
    <section id={id} className={styles.section}>
      <Container className={styles.content}>{children}</Container>
    </section>
  );
}
