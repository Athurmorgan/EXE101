import type { ElementType } from 'react';
import { useInView } from '@/hooks/useInView';
import { cx } from '@/utils/cx';
import styles from './WordReveal.module.css';

interface WordRevealProps {
  as?: ElementType;
  text: string;
  /** Trailing words drawn in a softer tone once revealed. */
  softText?: string;
  className?: string;
}

const WORD_STAGGER_MS = 35;

/** Words light up one after another the first time the text scrolls into view. */
export function WordReveal({ as: Tag = 'p', text, softText, className }: WordRevealProps) {
  const { ref, inView } = useInView<HTMLElement>({ threshold: 0.3 });
  const words = text.split(' ');
  const softWords = softText ? softText.split(' ') : [];

  const renderWord = (word: string, index: number, soft: boolean) => (
    <span
      key={index}
      className={cx(styles.word, soft && styles.soft)}
      style={{ transitionDelay: `${index * WORD_STAGGER_MS}ms` }}
    >
      {word}{' '}
    </span>
  );

  return (
    <Tag ref={ref} className={cx(styles.root, inView && styles.visible, className)}>
      {words.map((word, index) => renderWord(word, index, false))}
      {softWords.map((word, index) => renderWord(word, words.length + index, true))}
    </Tag>
  );
}
