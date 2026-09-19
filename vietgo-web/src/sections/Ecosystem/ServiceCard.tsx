import { CurtainReveal } from '@/components/ui/CurtainReveal';
import { IconBadge } from '@/components/ui/IconBadge';
import { Image } from '@/components/ui/Image';
import styles from './ServiceCard.module.css';
import type { Service } from './services';

interface ServiceCardProps {
  service: Service;
  /** Delay in ms before the photo curtain opens, used to stagger neighbouring cards. */
  delay?: number;
}

export function ServiceCard({ service, delay }: ServiceCardProps) {
  return (
    <article className={styles.card}>
      <CurtainReveal delay={delay} className={styles.photoFrame}>
        <Image image={service.image} decorative className={styles.photo} />
      </CurtainReveal>
      <div className={styles.shade} />
      <div className={styles.content}>
        <IconBadge name={service.icon} />
        <h3>{service.title}</h3>
        <p>{service.description}</p>
      </div>
    </article>
  );
}
