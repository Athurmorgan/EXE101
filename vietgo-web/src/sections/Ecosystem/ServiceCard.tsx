import { Icon } from '@/components/ui/Icon';
import { Image } from '@/components/ui/Image';
import styles from './ServiceCard.module.css';
import type { Service } from './services';

interface ServiceCardProps {
  service: Service;
}

export function ServiceCard({ service }: ServiceCardProps) {
  return (
    <article className={styles.card}>
      <Image image={service.image} decorative className={styles.photo} />
      <div className={styles.content}>
        <span className={styles.icon}>
          <Icon name={service.icon} size={20} />
        </span>
        <h3>{service.title}</h3>
        <p>{service.description}</p>
      </div>
    </article>
  );
}
