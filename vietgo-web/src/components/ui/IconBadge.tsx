import { Icon, type IconName } from './Icon';
import styles from './IconBadge.module.css';

/** Rounded tinted square that frames a feature icon. */
export function IconBadge({ name }: { name: IconName }) {
  return (
    <span className={styles.badge}>
      <Icon name={name} size={24} />
    </span>
  );
}
