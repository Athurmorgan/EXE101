/** Three lines through the centre = six spokes, 60 degrees apart, from the hub out to the rim. */
const SPOKES = 'M16 6v20M24.66 11 7.34 21M24.66 21 7.34 11';

/**
 * The vivivu wheel: a thick tyre, a gap, a rim, six spokes and a hub with a
 * red axle. Everything but the axle uses `currentColor`, so it works on both
 * the light landing bar and the dark app header. Shared by the landing
 * `Logo` (CSS Modules) and the app `Logo` (Tailwind) — styling stays inline.
 */
export function WheelMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" aria-hidden="true" fill="none" stroke="currentColor">
      <circle cx="16" cy="16" r="13.2" strokeWidth="3.6" />
      <circle cx="16" cy="16" r="9.6" strokeWidth="1.6" />
      <path d={SPOKES} strokeWidth="2" strokeLinecap="round" />
      <circle cx="16" cy="16" r="4" fill="currentColor" stroke="none" />
      <circle cx="16" cy="16" r="1.5" stroke="none" style={{ fill: 'var(--color-red, #e8382d)' }} />
    </svg>
  );
}
