/**
 * Doi import `@/...` thanh duong dan tuong doi.
 *
 * Ly do: alias path chi co hieu luc luc bien dich. Khi chay `node dist/main.js`,
 * Node khong doc `tsconfig.json` nen khong hieu `@` la gi. Tuong doi thi moi
 * moi truong deu chay duoc ma khong can `tsconfig-paths` hay `module-alias`.
 *
 * Chay 1 lan: node scripts/rewrite-alias.mjs
 */
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const SRC_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'src');

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(path);
    else if (entry.name.endsWith('.ts')) yield path;
  }
}

let changed = 0;

for await (const file of walk(SRC_DIR)) {
  const source = await readFile(file, 'utf8');

  // `@/common/x` -> duong dan tuong doi tu thu muc chua file hien tai.
  const updated = source.replace(/from '@\/([^']+)'/g, (_match, target) => {
    const absoluteTarget = join(SRC_DIR, target);
    let rel = relative(dirname(file), absoluteTarget).replaceAll('\\', '/');
    if (!rel.startsWith('.')) rel = `./${rel}`;
    return `from '${rel}'`;
  });

  if (updated !== source) {
    await writeFile(file, updated, 'utf8');
    changed += 1;
    console.log(`  ${file.replace(SRC_DIR, 'src')}`);
  }
}

console.log(`\nDa doi ${changed} file.`);
