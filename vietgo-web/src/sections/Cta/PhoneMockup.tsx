import { Icon, type IconName } from '@/components/ui/Icon';
import styles from './PhoneMockup.module.css';

interface QuickAction {
  label: string;
  icon: IconName;
}

const QUICK_ACTIONS: readonly QuickAction[] = [
  { label: 'Eat', icon: 'eat' },
  { label: 'Move', icon: 'move' },
  { label: 'Stay', icon: 'bed' },
  { label: 'Pay', icon: 'wallet' },
];

const MAP_PINS = [
  { left: '22%', top: '30%', color: 'var(--color-red)' },
  { left: '60%', top: '55%', color: '#2fd18f' },
  { left: '40%', top: '72%', color: '#f2b84b' },
] as const;

/** Decorative phone showing a simplified VietGo home screen. */
export function PhoneMockup() {
  return (
    <div className={styles.wrap} aria-hidden="true">
      <div className={styles.ring} />
      <div className={`${styles.ring} ${styles.ringInner}`} />

      <div className={styles.phone}>
        <div className={styles.screen}>
          <div className={styles.top}>
            <b>VietGo</b>
            <span>Hà Nội · 27°C</span>
          </div>

          <div className={styles.map}>
            {MAP_PINS.map(({ left, top, color }) => (
              <i key={left} className={styles.pin} style={{ left, top, background: color }} />
            ))}
          </div>

          <div className={styles.actions}>
            {QUICK_ACTIONS.map(({ label, icon }) => (
              <span key={label}>
                <Icon name={icon} size={16} />
                {label}
              </span>
            ))}
          </div>

          <div className={styles.card}>
            <b>Phở Thìn · 350 m</b>
            <small>Open · 4.7 ★</small>
          </div>
        </div>
      </div>
    </div>
  );
}
