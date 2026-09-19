import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { cx } from '@/utils/cx';
import styles from './Header.module.css';
import { Logo } from './Logo';
import { NAV_LINKS } from './navigation';
import { ScrollProgress } from './ScrollProgress';

/** Number of links shown to the left of the logo; the rest go to its right. */
const LEFT_LINK_COUNT = 3;
const LEFT_LINKS = NAV_LINKS.slice(0, LEFT_LINK_COUNT);
const RIGHT_LINKS = NAV_LINKS.slice(LEFT_LINK_COUNT);

/** Floating frosted-glass navigation bar. */
export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return (
    <header className={styles.header}>
      <Container>
        <div className={styles.glass}>
          <nav aria-label="Main" className={styles.bar}>
            <div className={styles.side}>
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
              <ul className={styles.links}>
                {LEFT_LINKS.map(({ label, href }) => (
                  <li key={href}>
                    <a href={href}>{label}</a>
                  </li>
                ))}
              </ul>
            </div>

            <Logo />

            <ul className={cx(styles.side, styles.sideEnd, styles.links)}>
              {RIGHT_LINKS.map(({ label, href }) => (
                <li key={href} className={styles.hideOnMobile}>
                  <a href={href}>{label}</a>
                </li>
              ))}
              <li>
                <Button href="#download" size="sm" withArrow>
                  Get the app
                </Button>
              </li>
            </ul>
          </nav>
          <ScrollProgress />
        </div>

        <nav
          id="expanded-menu"
          aria-label="Expanded menu"
          className={cx(styles.glass, styles.panel, menuOpen && styles.panelOpen)}
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
          </ul>
        </nav>
      </Container>
    </header>
  );
}
