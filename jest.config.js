/**
 * Jest covers pure logic and services. Anything crossing an HTTP or browser boundary is a
 * Cypress spec instead, so this config deliberately only looks inside src/.
 *
 * Plain .js rather than .ts: a TypeScript config file would require ts-node purely to read it.
 */

/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/?(*.)+(spec).[jt]s?(x)'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.tsx?$': [
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
  clearMocks: true,
  collectCoverageFrom: ['src/lib/**/*.ts', '!src/lib/**/*.spec.ts'],
};

module.exports = config;
