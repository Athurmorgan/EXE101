// ESLint flat config cho apps/api.
// Quy tac phan anh `.cursor/rules/02-coding-standards.mdc` — doi mot ben,
// doi ca hai ben.
const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const prettier = require('eslint-config-prettier');

module.exports = [
  { ignores: ['dist/**', 'node_modules/**', 'coverage/**', '**/*.js'] },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  prettier,
  {
      languageOptions: {
        parserOptions: {
          // `spec` bao gom ca file test; `prisma` phuc vu `seed.ts` (chay
          // bang `ts-node` rieng, khong nam trong tsconfig cua app).
          project: ['./tsconfig.json', './tsconfig.spec.json', './prisma/tsconfig.json'],
          tsconfigRootDir: __dirname,
        },
      globals: {
        process: 'readonly',
        console: 'readonly',
        Buffer: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        require: 'readonly',
        module: 'writable',
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        jest: 'readonly',
      },
    },
    rules: {
      // Moi ham phai khai bao kieu tra ve — doc ma de sua sau.
      '@typescript-eslint/explicit-function-return-type': 'error',
      '@typescript-eslint/explicit-module-boundary-types': 'error',

      // Cam kieu rong. Dung type `unknown` roi thu hep, hoac define kieu rieng.
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',

      // --- NestJS ---
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': ['error', { checksVoidReturn: false }],

      // --- Quy tac ---
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'no-console': ['warn', { allow: ['log', 'error', 'warn'] }],
      'prefer-const': 'error',
      'no-var': 'error',
      '@typescript-eslint/naming-convention': [
        'error',
        { selector: 'class', format: ['PascalCase'] },
        { selector: 'typeLike', format: ['PascalCase'] },
        { selector: 'function', format: ['camelCase'] },
        { selector: 'variable', format: ['camelCase', 'UPPER_CASE', 'PascalCase'] },
        { selector: 'parameter', format: ['camelCase'], leadingUnderscore: 'allow' },
      ],

      // Decorator factory (`@Roles()`, `@Public()`) va hang so `as const`
      // (`ErrorCode.INVALID_CREDENTIALS`) la quy uoc chuan cua NestJS —
      // khong phai loi dat ten.
      '@typescript-eslint/no-unsafe-enum-comparison': 'off',

      // Arrow function khai bao `async` de trung khop chu ky Prisma (`findUnique`
      // tra Promise) du khong co `await` ben trong.
      '@typescript-eslint/require-await': 'off',
    },
  },
  {
    // File chua decorator NestJS. `import type` se bi xoa luc bien dich, lam
    // `design:paramtypes` tro thanh `Object` → moi field cua DTO bao loi
    // "property X should not exist" tu ValidationPipe. Bat buong o day.
    files: ['**/*.controller.ts', '**/*.dto.ts', '**/*.strategy.ts', '**/*.guard.ts'],
    rules: {
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports', disallowTypeAnnotations: false },
      ],
    },
  },
  {
    // File test va seed duoc phep `any` va in console de don gian.
    files: ['**/*.spec.ts', '**/*.e2e-spec.ts', 'test/**/*.ts', 'prisma/**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-misused-promises': 'off',
      'no-console': 'off',
    },
  },
];
