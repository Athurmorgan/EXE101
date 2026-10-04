/**
 * Dong bo kieu TypeScript cho frontend tu OpenAPI cua backend.
 *
 *   1. Chay API:  npm run start:dev
 *   2. Chay lenh nay: npm run sync:api
 *   3. Ghi ra:    D:\EXE\fe\vietgo-web\src\types\api.generated.ts
 *
 * File sinh ra KHONG sua tay — moi lan chay se ghi de.
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const API_URL = process.env.SYNC_API_URL ?? 'http://localhost:3000';
const SPEC_URL = `${API_URL}/api/docs-json`;
const OUTPUT_PATH =
  process.env.SYNC_OUTPUT ?? 'D:/EXE/fe/vietgo-web/src/types/api.generated.ts';

const VERBS = ['get', 'post', 'patch', 'put', 'delete'];

/** Tra ve kieu TypeScript cho mot schema OpenAPI. */
function schemaToType(schema, indent = 0) {
  if (!schema) return 'unknown';
  const pad = '  '.repeat(indent);

  if (schema.$ref) return schema.$ref.split('/').pop();

  if (schema.type === 'string') {
    if (schema.enum) return schema.enum.map((value) => JSON.stringify(value)).join(' | ');
    return 'string';
  }
  if (schema.type === 'integer' || schema.type === 'number') return 'number';
  if (schema.type === 'boolean') return 'boolean';
  if (schema.type === 'array') return `${schemaToType(schema.items, indent)}[]`;

  const properties = schema?.properties ?? {};
  const required = new Set(schema?.required ?? []);
  const entries = Object.entries(properties);

  if (schema?.type !== 'object' || entries.length === 0) return 'Record<string, unknown>';

  const lines = entries.map(([key, value]) => {
    const optional = required.has(key) ? '' : '?';
    const safeKey = /^[A-Za-z_$][\w$]*$/.test(key) ? key : JSON.stringify(key);
    return `${pad}  ${safeKey}${optional}: ${schemaToType(value, indent + 1)};`;
  });

  return `{\n${lines.join('\n')}\n${pad}}`;
}

async function main() {
  console.log(`Dang tai OpenAPI tu ${SPEC_URL} ...`);

  const response = await fetch(SPEC_URL);
  if (!response.ok) {
    console.error(
      `Khong tai duoc OpenAPI (HTTP ${response.status}). ` +
        'Chay "npm run start:dev" truoc khi dong bo.',
    );
    process.exitCode = 1;
    return;
  }

  const spec = await response.json();
  const schemas = spec.components?.schemas ?? {};
  const paths = spec.paths ?? {};

  // Danh sach endpoint de frontend doc duoc, tranh phai nho tu dau.
  const rows = Object.entries(paths).flatMap(([path, methods]) =>
    VERBS.filter((verb) => methods[verb]).map(
      (verb) => ` * | \`${verb.toUpperCase()} ${path}\` | ${methods[verb].summary ?? ''} |`,
    ),
  );

  const types = Object.entries(schemas)
    .map(([name, schema]) => `export interface ${name} ${schemaToType(schema)}\n`)
    .join('\n');

  const endpointMap = Object.fromEntries(
    Object.entries(paths).map(([path, methods]) => [path, VERBS.filter((v) => methods[v])]),
  );

  const contents = `/**
 * AUTO-GENERATED — DO NOT EDIT.
 *
 * Sinh tu OpenAPI cua NestJS bang \`npm run sync:api\`.
 * Chay lai lenh do sau moi lan backend doi DTO.
 *
 * Generated from: ${SPEC_URL}
 */

/* eslint-disable */

// ---- Schemas ----

${types}
// ---- Endpoints ----

/**
 * | Method | Mo ta |
 * | --- | --- |
${rows.join('\n')}
 */
export const API_ENDPOINTS = ${JSON.stringify(endpointMap, null, 2)} as const;
`;

  const absoluteOutput = resolve(OUTPUT_PATH);
  await mkdir(dirname(absoluteOutput), { recursive: true });
  await writeFile(absoluteOutput, contents, 'utf8');

  console.log(`Da ghi ${Object.keys(schemas).length} schema va ${rows.length} endpoint`);
  console.log(`  -> ${absoluteOutput}`);
}

main().catch((error) => {
  console.error('Dong bo that bai:', error.message);
  process.exitCode = 1;
});
