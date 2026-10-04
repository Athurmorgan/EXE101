/** Jest config cho unit test trong `src`. E2E tach rieng o `test/jest-e2e.json`. */
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: 'src/.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': ['ts-jest', { tsconfig: 'tsconfig.json' }],
  },
  moduleNameMapper: {
    // Khong con alias `@/` — import da la duong dan tuong doi,
    // nen jest resolve truc tiep nhu Node.
    '^@vivivu/shared$': '<rootDir>/../../packages/shared/dist/index.js',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    // Khong tinh coverage cho file kiem thu va file chi khai bao.
    '!src/**/*.spec.ts',
    '!src/**/*.module.ts',
    '!src/main.ts',
    '!src/**/*.dto.ts',
  ],
  coverageDirectory: './coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  testEnvironment: 'node',
  clearMocks: true,
  restoreMocks: true,
};
