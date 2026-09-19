import type { ReactNode } from 'react';
import styles from './ButtonGroup.module.css';

export function ButtonGroup({ children }: { children: ReactNode }) {
  return <div className={styles.group}>{children}</div>;
}
