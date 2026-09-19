import type { ReactNode } from 'react';
import { cx } from '@/utils/cx';
import styles from './Container.module.css';

interface ContainerProps {
  children: ReactNode;
  className?: string;
}

export function Container({ children, className }: ContainerProps) {
  return <div className={cx(styles.container, className)}>{children}</div>;
}
