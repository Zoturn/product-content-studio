/**
 * Jest covers pure logic and services. Anything crossing an HTTP or browser boundary is a
 * Cypress spec instead. Scope is src/ plus prisma/ — the latter only for the seed's fixture
 * data, which is worth unit-testing against the same length limits the editor enforces.
 *
 * Plain .js rather than .ts: a TypeScript config file would require ts-node purely to read it.
 */

/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/prisma'],
  setupFiles: ['<rootDir>/jest.setup.ts'],
  testMatch: ['**/?(*.)+(spec).[jt]s?(x)'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    // Matches .js too, not just .ts(x): jose ships ESM-only, and this is what lets ts-jest
    // (with allowJs) convert its .js files to CommonJS instead of Jest trying to require() them
    // directly and failing.
    '^.+\\.(t|j)sx?$': [
      'ts-jest',
      {
        tsconfig: {
          module: 'commonjs',
          jsx: 'react-jsx',
          esModuleInterop: true,
          allowJs: true,
        },
      },
    ],
  },
  // node_modules is ignored by default; carve out jose so the transform above actually reaches it.
  transformIgnorePatterns: ['node_modules/(?!(jose)/)'],
  clearMocks: true,
  collectCoverageFrom: ['src/lib/**/*.ts', '!src/lib/**/*.spec.ts'],
};

module.exports = config;
