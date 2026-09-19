import type { ReactNode } from 'react';
import { cx } from '@/utils/cx';
import styles from './Button.module.css';
import { Icon, type IconName } from './Icon';

interface ButtonProps {
  href: string;
  children: ReactNode;
  variant?: 'red' | 'white' | 'dark';
  size?: 'md' | 'sm';
  /** Icon shown before the label (e.g. a store logo). */
  leadingIcon?: IconName;
  /** Shows a trailing "external" arrow. */
  withArrow?: boolean;
  className?: string;
}

export function Button({
  href,
  children,
  variant = 'red',
  size = 'md',
  leadingIcon,
  withArrow = false,
  className,
}: ButtonProps) {
  return (
    <a href={href} className={cx(styles.button, styles[variant], styles[size], className)}>
      {leadingIcon && <Icon name={leadingIcon} size={18} />}
      {children}
      {withArrow && <Icon name="arrow" />}
    </a>
  );
}
