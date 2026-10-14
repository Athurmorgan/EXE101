import { Fragment } from 'react';

/** Renders text lines separated by line breaks, so headings can live in plain data files. */
export function Lines({ lines }: { lines: readonly string[] }) {
  return (
    <>
      {lines.map((line, index) => (
        <Fragment key={line}>
          {index > 0 && <br />}
          {line}
        </Fragment>
      ))}
    </>
  );
}
