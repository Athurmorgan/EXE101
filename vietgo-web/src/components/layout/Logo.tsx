import styles from './Logo.module.css';

/** Three lines through the centre = six spokes, 60 degrees apart, from the hub out to the rim. */
const SPOKES = 'M16 6v20M24.66 11 7.34 21M24.66 21 7.34 11';

/**
 * A single wheel: a thick smooth tyre, a gap, a rim, six thick spokes and a hub with a red
 * axle. The thick tyre, the gap to the rim and the spokes make it read as a wheel rather than
 * a plain circle. Everything but the axle uses the current text colour (black on the light bar,
 * white on the dark footer). It turns half a revolution on hover.
 */
function Wheel() {
  return (
    <svg className={styles.wheel} viewBox="0 0 32 32" aria-hidden="true">
      <circle cx="16" cy="16" r="13.2" className={styles.tyre} />
      <circle cx="16" cy="16" r="9.6" className={styles.rim} />
      <path d={SPOKES} className={styles.spokes} />
      <circle cx="16" cy="16" r="4" className={styles.hub} />
      <circle cx="16" cy="16" r="1.5" className={styles.axle} />
    </svg>
  );
}

export function Logo() {
  return (
    <a href="#top" className={styles.logo} aria-label="VietGo, back to top">
      <Wheel />
      VietGo
    </a>
  );
}
