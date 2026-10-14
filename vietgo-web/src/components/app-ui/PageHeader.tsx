import type { ReactNode } from 'react';
import { Container } from '@/components/app-layout/Container';

interface PageHeaderProps {
  eyebrow: string;
  title: ReactNode;
  lead?: ReactNode;
  /** Right-aligned on desktop, e.g. a primary action. */
  actions?: ReactNode;
}

/** The editorial page opener every app screen shares: small caps eyebrow, serif title. */
export function PageHeader({ eyebrow, title, lead, actions }: PageHeaderProps) {
  return (
    <section className="border-b border-ink/10">
      <Container className="flex flex-col gap-6 py-12 sm:flex-row sm:items-end sm:justify-between sm:py-16">
        <div className="max-w-2xl">
          <p className="text-xs font-medium tracking-wider text-muted uppercase">{eyebrow}</p>
          <h1 className="mt-3 font-serif text-4xl leading-[1.05] tracking-tight text-ink sm:text-5xl">{title}</h1>
          {lead && <p className="mt-4 text-base text-muted">{lead}</p>}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap gap-3">{actions}</div>}
      </Container>
    </section>
  );
}
