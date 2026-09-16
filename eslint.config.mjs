import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';
import prettier from 'eslint-config-prettier';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  // Last: switches off every rule Prettier already decides, so the two never disagree.
  prettier,
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'build/**',
      'coverage/**',
      'cypress/screenshots/**',
      'cypress/videos/**',
      'next-env.d.ts',
    ],
  },
  {
    // .claude/rules/prisma-data-model.md rules 2-4 require every product query to live in the
    // service layer, so the published-only filter is written once where it can be reviewed
    // rather than restated at each call site. Without this rule that is a convention, held up
    // by whoever is reading the diff; with it, the boundary fails the build instead. Pages,
    // route handlers and components go through src/lib/services/**, which is the only place
    // allowed to import the client directly.
    files: ['src/app/**/*.{ts,tsx}', 'src/components/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@/lib/prisma',
              message:
                'Query through src/lib/services/** instead. A where clause written here is a ' +
                'status filter that can be forgotten — see .claude/rules/prisma-data-model.md.',
            },
            {
              name: '@prisma/client',
              importNames: ['PrismaClient'],
              message:
                'Never construct a PrismaClient outside src/lib/prisma.ts. Importing types or ' +
                'the ProductStatus enum from @prisma/client is fine.',
            },
          ],
        },
      ],
    },
  },
];

export default eslintConfig;
