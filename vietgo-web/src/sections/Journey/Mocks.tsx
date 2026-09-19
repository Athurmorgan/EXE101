import type { ReactNode } from 'react';
import styles from './Mocks.module.css';

interface FeedItem {
  color: string;
  title: string;
  meta: string;
}

interface PlanItem {
  time: string;
  title: string;
  meta: string;
}

const FEED_ITEMS: readonly FeedItem[] = [
  { color: '#e8382d', title: 'Cộng Cà Phê, Hàng Bồng', meta: 'Saved by 3 friends · 400 m' },
  { color: '#2fd18f', title: 'Courtyard café · Old Quarter', meta: 'Local pick · Open now' },
  { color: '#f2b84b', title: 'Egg coffee walk', meta: 'Story by @minhanh · 2.1k likes' },
];

const PLAN_ITEMS: readonly PlanItem[] = [
  { time: '19:40', title: 'Table for 4 · Bếp Mẹ Ỉn', meta: 'Confirmed' },
  { time: '20:30', title: 'Split bill · 4 × 185.000₫', meta: 'Paid with VietGo Wallet' },
  { time: '21:15', title: 'Ride to Nhà Hát Thành Phố', meta: 'Driver arrives in 3 min' },
  { time: '21:45', title: 'Live show · 2 tickets', meta: 'Row C, seats 12–13' },
];

/** Decorative app-screen frame; hidden from assistive tech because it is illustrative. */
function MockCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className={styles.mock} aria-hidden="true">
      <div className={styles.bar}>
        <span className={styles.barDot} />
        <b>{title}</b>
      </div>
      {children}
    </div>
  );
}

export function FeedMock() {
  return (
    <MockCard title="Around you">
      {FEED_ITEMS.map(({ color, title, meta }) => (
        <div key={title} className={styles.row}>
          <i className={styles.thumb} style={{ background: color }} />
          <div>
            <b>{title}</b>
            <small>{meta}</small>
          </div>
        </div>
      ))}
      <div className={styles.cta}>Navigate there →</div>
    </MockCard>
  );
}

export function PlanMock() {
  return (
    <MockCard title="Tonight">
      <div className={styles.timeline}>
        {PLAN_ITEMS.map(({ time, title, meta }) => (
          <div key={time} className={styles.step}>
            <em>{time}</em>
            <b>{title}</b>
            <small>{meta}</small>
          </div>
        ))}
      </div>
    </MockCard>
  );
}
