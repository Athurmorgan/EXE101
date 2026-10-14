import { WheelMark } from '@/components/brand/WheelMark';
import styles from './Logo.module.css';

/** Landing logo: the wheel turns half a revolution on hover. */
export function Logo() {
  return (
    <a href="#top" className={styles.logo} aria-label="vivivu, back to top">
      <WheelMark className={styles.wheel} />
      vivivu
    </a>
  );
}
