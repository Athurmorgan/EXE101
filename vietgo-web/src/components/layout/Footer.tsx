import { Container } from '@/components/layout/Container';
import { useInView } from '@/hooks/useInView';
import { cx } from '@/utils/cx';
import styles from './Footer.module.css';
import { FOOTER_LINKS } from './navigation';

export function Footer() {
  const { ref, inView } = useInView<HTMLElement>({ threshold: 0.3 });

  return (
    <footer ref={ref} className={cx(styles.footer, inView && styles.visible)} data-tone="dark">
      <Container>
        <p className={styles.wordmark} aria-hidden="true">
          <span>vivivu</span>
        </p>
        <div className={styles.inner}>
          <ul className={styles.links}>
            {FOOTER_LINKS.map(({ label, href }) => (
              <li key={label}>
                <a href={href}>{label}</a>
              </li>
            ))}
          </ul>
          <p className={styles.copy}>© {new Date().getFullYear()} vivivu · Made in Vietnam</p>
        </div>
      </Container>
    </footer>
  );
}
