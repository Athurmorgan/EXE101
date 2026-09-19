import { Container } from '@/components/ui/Container';
import styles from './Footer.module.css';
import { Logo } from './Logo';
import { FOOTER_LINKS } from './navigation';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <Container className={styles.inner}>
        <Logo />
        <ul className={styles.links}>
          {FOOTER_LINKS.map(({ label, href }) => (
            <li key={label}>
              <a href={href}>{label}</a>
            </li>
          ))}
        </ul>
        <p className={styles.copy}>© {new Date().getFullYear()} VietGo · Made in Vietnam</p>
      </Container>
    </footer>
  );
}
