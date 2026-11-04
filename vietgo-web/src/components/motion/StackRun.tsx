import { useRef, type CSSProperties, type ReactNode } from 'react';
import { Image } from '@/components/ui/Image';
import type { ImageAsset } from '@/data/images';
import { DESKTOP, MOTION_OK, gsap, useGSAP } from '@/lib/gsap';
import styles from './StackRun.module.css';

export interface StackItem {
  key: string;
  image: ImageAsset;
  title: string;
  caption?: string;
}

interface StackRunProps {
  /** One large card per item, in the same order as the slots in `children`. */
  items: readonly StackItem[];
  /** The resting layout the stack settles into. */
  children: ReactNode;
  /** Elements in `children` the cards fly back to, matched by order. */
  slotSelector?: string;
}

/** Scroll distance, in viewport heights, given to each card and to the final settle. */
const PER_CARD_VH = 50;
const SETTLE_VH = 160;

/** How far a covered card sinks back for each card stacked on top of it (capped). */
const DEPTH_STEP = { scale: 0.05, y: 18, dim: 0.22 };
const MAX_DEPTH = 3;

/**
 * Pins the section and deals its photos one by one: each large card slides in from the right and
 * lands on top of the stack while the ones beneath sink back. After the last card the whole stack
 * flies back into the resting layout and hands over to it. Cards move by translate and resize
 * their frame instead of scaling up, so photos stay sharp. Small screens and reduced motion get
 * the resting layout only.
 */
export function StackRun({ items, children, slotSelector = 'ul > li' }: StackRunProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const deckRef = useRef<HTMLDivElement>(null);
  const layoutRef = useRef<HTMLDivElement>(null);
  const height = (items.length - 1) * PER_CARD_VH + SETTLE_VH + 100;

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(`${DESKTOP} and ${MOTION_OK}`, () => {
        const deck = deckRef.current;
        const layout = layoutRef.current;
        if (!deck || !layout) return;

        const cards = gsap.utils.toArray<HTMLElement>(`.${styles.card}`, deck);
        const shades = cards.map((card) => card.querySelector(`.${styles.shade}`));
        const captions = cards.map((card) => card.querySelector(`.${styles.caption}`));

        /** Where slot `i` sits relative to the deck, and whether any of it shows in its carousel. */
        const slot = (i: number) => {
          const el = layout.querySelectorAll<HTMLElement>(slotSelector)[i];
          const base = deck.getBoundingClientRect();
          if (!el) return { left: base.width, top: 0, width: 0, height: 0, shown: false };
          const box = el.getBoundingClientRect();
          const clip = (el.parentElement ?? el).getBoundingClientRect();
          return {
            left: box.left - base.left,
            top: box.top - base.top,
            width: box.width,
            height: box.height,
            shown: box.right > clip.left && box.left < clip.right,
          };
        };

        // Cards deal in from beyond the content edge but settle inside it, as the carousel does.
        const open = 'inset(-100vh -100vw -100vh -100vw)';
        gsap.set(deck, { autoAlpha: 1, clipPath: open });
        gsap.set(layout, { autoAlpha: 0 });
        gsap.set(cards.slice(1), { x: () => window.innerWidth });

        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: rootRef.current,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.8,
            invalidateOnRefresh: true,
          },
        });

        // Deal: card i slides over the stack while every card beneath sinks one step deeper.
        cards.forEach((card, i) => {
          if (i === 0) return;
          const at = i - 1;
          tl.to(card, { x: 0, duration: 1, ease: 'power3.out' }, at);
          cards.slice(0, i).forEach((below, j) => {
            const depth = Math.min(i - j, MAX_DEPTH);
            tl.to(
              below,
              { scale: 1 - depth * DEPTH_STEP.scale, y: depth * DEPTH_STEP.y, duration: 1 },
              at,
            );
            tl.to(shades[j] ?? [], { opacity: depth * DEPTH_STEP.dim, duration: 1 }, at);
          });
        });

        // Settle: from the top card down, each flies back to its slot in the layout.
        const settleAt = cards.length - 1 + 0.4;
        tl.to(captions, { autoAlpha: 0, duration: 0.3 }, settleAt);
        tl.to(shades, { opacity: 0, duration: 1 }, settleAt);
        tl.fromTo(
          deck,
          { clipPath: open },
          { clipPath: 'inset(-100vh 0vw -100vh -100vw)', duration: 1.6, ease: 'power3.inOut' },
          settleAt,
        );
        cards.forEach((card, i) => {
          tl.to(
            card,
            {
              left: () => slot(i).left,
              top: () => slot(i).top,
              width: () => slot(i).width,
              height: () => slot(i).height,
              autoAlpha: () => (slot(i).shown ? 1 : 0),
              x: 0,
              y: 0,
              scale: 1,
              duration: 1.6,
              ease: 'power3.inOut',
            },
            settleAt + (cards.length - 1 - i) * 0.06,
          );
        });

        // Hand over to the real layout, which sits exactly under the settled cards.
        tl.to(layout, { autoAlpha: 1, duration: 0.3 }, '>-0.1');
        tl.to(deck, { autoAlpha: 0, duration: 0.3 }, '<0.15');
        tl.to({}, { duration: 0.3 });
      });

      return () => mm.revert();
    },
    { scope: rootRef, dependencies: [items.length, slotSelector] },
  );

  return (
    <div
      ref={rootRef}
      className={styles.pin}
      style={{ '--pin-height': `${height}vh` } as CSSProperties}
    >
      <div className={styles.stage}>
        <div ref={layoutRef} className={styles.layout}>
          {children}
        </div>

        <div ref={deckRef} className={styles.deck} aria-hidden="true">
          {items.map((item, index) => (
            <div key={item.key} className={styles.card} style={{ zIndex: index }}>
              <Image image={item.image} decorative className={styles.photo} />
              <div className={styles.shade} />
              <div className={styles.caption}>
                <span className={styles.count}>
                  {String(index + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
                </span>
                <h3>{item.title}</h3>
                {item.caption && <p>{item.caption}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
