import type { ReactNode } from 'react';
import { Logo } from './Logo';

/**
 * Split screen for sign-in / sign-up: photo + tagline on the left (desktop
 * only), the form on the right. The gradient is functional — it keeps the
 * cream text legible over any photo — not decoration.
 */
export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen bg-cream lg:grid-cols-[1.1fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-dark lg:block">
        <img
          src="/images/hoian-night.webp"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-75"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/30 to-dark/10" />
        <div className="relative flex h-full flex-col justify-between p-12 text-cream">
          <Logo tone="light" />
          <figure className="max-w-md">
            <blockquote className="font-serif text-3xl leading-snug">
              The best bowl of phở in Hà Nội has no sign, no menu and no English.
            </blockquote>
            <figcaption className="mt-4 text-sm text-cream/70">
              vivivu shows you where it is anyway.
            </figcaption>
          </figure>
        </div>
      </aside>

      <div className="flex flex-col">
        <div className="px-6 pt-6 lg:hidden">
          <Logo />
        </div>
        <main className="flex flex-1 items-center justify-center px-6 py-12">
          <div className="w-full max-w-sm">{children}</div>
        </main>
      </div>
    </div>
  );
}
