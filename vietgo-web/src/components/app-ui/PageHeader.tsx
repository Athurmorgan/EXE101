import type { ReactNode } from 'react';
import { Container } from '@/components/app-layout/Container';

interface PageHeaderProps {
  eyebrow: string;
  title: ReactNode;
  lead?: ReactNode;
  /** Right-aligned on desktop, e.g. a primary action. */
  actions?: ReactNode;
}

/** The editorial page opener every app screen shares: starred eyebrow, large serif title, hairline rule. */
export function PageHeader({ eyebrow, title, lead, actions }: PageHeaderProps) {
  return (
    <section className="border-b border-ink/20">
      <Container className="flex flex-col gap-6 py-14 sm:flex-row sm:items-end sm:justify-between sm:py-20">
        <div className="max-w-2xl">
          <p className="app-eyebrow">{eyebrow}</p>
          <h1 className="mt-5 font-serif text-[2.75rem] leading-[1.02] tracking-[-0.015em] text-ink sm:text-6xl [&_em]:italic">
            {title}
          </h1>
          {lead && <p className="mt-5 max-w-xl text-base leading-relaxed text-muted">{lead}</p>}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap gap-3">{actions}</div>}
      </Container>
    </section>
  );
}
