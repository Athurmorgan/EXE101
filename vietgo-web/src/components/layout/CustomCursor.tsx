import { useEffect, useRef } from 'react';
import styles from './CustomCursor.module.css';

type CursorState = 'default' | 'link' | 'view' | 'text';

const TEXT_FIELDS =
  'input:not([type=checkbox],[type=radio],[type=submit],[type=button]), textarea, select, [contenteditable]';
const INTERACTIVE = 'a, button, [role=button], label, summary, [data-cursor]';

/** Picks how the cursor should look over the element under the pointer. */
function stateFor(target: Element): CursorState {
  if (target.closest(TEXT_FIELDS)) return 'text';
  const interactive = target.closest<HTMLElement>(INTERACTIVE);
  if (!interactive) return 'default';
  if (interactive.dataset.cursor === 'view' || interactive.querySelector('img')) return 'view';
  return 'link';
}

/**
 * A dot that sits on the pointer and a ring that eases after it. The ring grows and fills over
 * links and buttons and offers "View" over photo links. It only animates while the mouse moves, so
 * it adds nothing to scrolling, and touch devices never mount it.
 */
export function CustomCursor() {
  const rootRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!root || !dot || !ring) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    const ease = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 1 : 0.18;
    const html = document.documentElement;
    html.classList.add('has-cursor');

    let x = -100;
    let y = -100;
    let ringX = x;
    let ringY = y;
    let frame = 0;

    const follow = () => {
      ringX += (x - ringX) * ease;
      ringY += (y - ringY) * ease;
      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
      frame = Math.abs(x - ringX) + Math.abs(y - ringY) > 0.2 ? requestAnimationFrame(follow) : 0;
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      x = event.clientX;
      y = event.clientY;
      dot.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      root.dataset.hidden = 'false';
      if (!frame) frame = requestAnimationFrame(follow);
    };
    const onOver = (event: PointerEvent) => {
      if (event.target instanceof Element) root.dataset.state = stateFor(event.target);
    };
    const onDown = () => (root.dataset.pressed = 'true');
    const onUp = () => (root.dataset.pressed = 'false');
    const onLeave = () => (root.dataset.hidden = 'true');

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerover', onOver, { passive: true });
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp);
    html.addEventListener('pointerleave', onLeave);

    return () => {
      cancelAnimationFrame(frame);
      html.classList.remove('has-cursor');
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerover', onOver);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      html.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className={styles.cursor}
      data-hidden="true"
      data-state="default"
      aria-hidden="true"
    >
      <div ref={ringRef} className={styles.ring}>
        <span className={styles.shape} />
        <span className={styles.label}>View</span>
      </div>
      <div ref={dotRef} className={styles.dot} />
    </div>
  );
}
