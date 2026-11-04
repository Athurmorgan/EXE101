import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/layout/Container';
import { useNavTone } from '@/hooks/useNavTone';
import { cx } from '@/utils/cx';
import styles from './Header.module.css';
import { Logo } from './Logo';
import { NAV_LINKS } from './navigation';

/** Full-width navigation bar: logo, centred links, account actions. */
export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);
  // Cream glass with ink text over the paper; a clear tint with cream text over photos and forest.
  const dark = useNavTone();

  return (
    <header className={cx(styles.header, dark && styles.dark)}>
      <Container>
        <div className={styles.glass}>
          <nav aria-label="Main" className={styles.bar}>
            <Logo />

            <ul className={styles.links}>
              {NAV_LINKS.map(({ label, href }) => (
                <li key={href}>
                  <a href={href}>{label}</a>
                </li>
              ))}
            </ul>

            <div className={styles.actions}>
              <Button href="/app/login" size="sm" variant="outline" className={styles.signIn}>
                Sign in
              </Button>
              <Button href="/app/discover" size="sm" variant={dark ? 'gold' : 'dark'}>
                Open the app
              </Button>
              <button
                type="button"
                className={cx(styles.menuButton, menuOpen && styles.menuButtonOpen)}
                aria-expanded={menuOpen}
                aria-controls="expanded-menu"
                aria-label="Toggle menu"
                onClick={() => setMenuOpen((open) => !open)}
              >
                <span />
                <span />
              </button>
            </div>
          </nav>
        </div>

        <nav
          id="expanded-menu"
          aria-label="Expanded menu"
          className={cx(styles.panel, menuOpen && styles.panelOpen)}
          inert={!menuOpen}
        >
          <ul>
            {NAV_LINKS.map(({ label, href }) => (
              <li key={href}>
                <a href={href} onClick={closeMenu}>
                  {label}
                </a>
              </li>
            ))}
            <li>
              <a href="/app/login" onClick={closeMenu}>
                Sign in
              </a>
            </li>
          </ul>
        </nav>
      </Container>
    </header>
  );
}
