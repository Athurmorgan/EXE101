import styles from './WordBand.module.css';

const WORDS = ['stay', 'eat', 'move', 'meet'];

function Phrase() {
  return (
    <span className={styles.phrase}>
      {WORDS.map((word) => (
        <span key={word}>
          {word} <em>&amp;</em>{' '}
        </span>
      ))}
    </span>
  );
}

/** A giant serif line that slides sideways as the page scrolls past, like the reference's band. */
export function WordBand() {
  return (
    <section className={styles.band} aria-label="Stay, eat, move and meet">
      <div className={styles.track} aria-hidden="true">
        <Phrase />
        <Phrase />
      </div>
    </section>
  );
}
