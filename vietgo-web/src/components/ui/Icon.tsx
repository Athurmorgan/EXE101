import type { ReactElement } from 'react';
import { cx } from '@/utils/cx';
import styles from './Icon.module.css';

const ICONS = {
  chat: <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-4.6A8 8 0 1 1 21 12Z" />,
  bed: (
    <>
      <path d="M3 18V6M3 14h18v4M21 14v-2a3 3 0 0 0-3-3h-7v5" />
      <circle cx="7" cy="11" r="1.6" />
    </>
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m15.5 8.5-2 5-5 2 2-5 5-2Z" />
    </>
  ),
  eat: <path d="M6 3v7a2 2 0 0 0 2 2v9M10 3v7a2 2 0 0 1-2 2M6 3v7M18 21V3c-2 1-3.5 4-3.5 8H18" />,
  move: (
    <>
      <circle cx="6" cy="17" r="3" />
      <circle cx="18" cy="17" r="3" />
      <path d="M9 17h6l-3-8h-3M15 9h3l1 4" />
    </>
  ),
  ticket: (
    <>
      <path d="M3 9a2 2 0 0 0 0 6v3h18v-3a2 2 0 0 1 0-6V6H3v3Z" />
      <path d="M14 6v12" strokeDasharray="2 2" />
    </>
  ),
  wallet: (
    <>
      <path d="M4 7a2 2 0 0 1 2-2h12v4M4 7v10a2 2 0 0 0 2 2h14V9H6a2 2 0 0 1-2-2Z" />
      <circle cx="16.5" cy="14" r="1" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3Z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </>
  ),
  headset: (
    <>
      <path d="M4 14v-2a8 8 0 0 1 16 0v2" />
      <rect x="3" y="14" width="4" height="6" rx="1.5" />
      <rect x="17" y="14" width="4" height="6" rx="1.5" />
      <path d="M19 20c0 1-2 2-5 2" />
    </>
  ),
  arrow: <path d="M7 17 17 7M8 7h9v9" />,
} satisfies Record<string, ReactElement>;

/** Brand glyphs are solid shapes, so they are filled instead of stroked. */
const FILLED_ICONS = {
  apple: (
    <path d="M16.4 12.6c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.15-2.8.85-3.5.85s-1.8-.8-3-.8c-1.5 0-3 .9-3.8 2.3-1.6 2.8-.4 7 1.2 9.3.8 1.1 1.7 2.4 2.9 2.3 1.2 0 1.6-.7 3-.7s1.8.7 3 .7c1.3 0 2.1-1.1 2.8-2.2.9-1.3 1.3-2.5 1.3-2.6-.1 0-2.5-1-2.5-3.9ZM14.2 5.7c.6-.8 1.1-1.9.9-3-.9 0-2.1.6-2.7 1.4-.6.7-1.1 1.8-1 2.9 1 .1 2.1-.5 2.8-1.3Z" />
  ),
  android: (
    <path d="M7 9h10v8a1 1 0 0 1-1 1h-1v3a1 1 0 0 1-2 0v-3h-2v3a1 1 0 0 1-2 0v-3H8a1 1 0 0 1-1-1V9Zm-3 1a1 1 0 0 1 2 0v5a1 1 0 0 1-2 0v-5Zm14 0a1 1 0 0 1 2 0v5a1 1 0 0 1-2 0v-5ZM15.5 3.3l1-1.5-.6-.4-1.1 1.6A5 5 0 0 0 12 2.5c-.9 0-1.7.2-2.4.5L8.5 1.4l-.6.4 1 1.5A4.9 4.9 0 0 0 7 8h10a4.9 4.9 0 0 0-1.5-4.7ZM10 6.2a.6.6 0 1 1 0-1.2.6.6 0 0 1 0 1.2Zm4 0a.6.6 0 1 1 0-1.2.6.6 0 0 1 0 1.2Z" />
  ),
} satisfies Record<string, ReactElement>;

export type IconName = keyof typeof ICONS | keyof typeof FILLED_ICONS;

interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
}

export function Icon({ name, size = 16, className }: IconProps) {
  const filled = name in FILLED_ICONS;
  const content = filled
    ? FILLED_ICONS[name as keyof typeof FILLED_ICONS]
    : ICONS[name as keyof typeof ICONS];

  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden="true"
      className={cx(styles.icon, filled && styles.filled, className)}
    >
      {content}
    </svg>
  );
}
