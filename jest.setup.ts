// Placeholder values so modules that validate configuration at import time (src/lib/env.ts) can
// load during Jest runs. No test in this suite makes a real database connection or reads the
// real .env — see .claude/rules/testing.md's offline requirement.
process.env.DATABASE_URL ??= 'postgresql://postgres:postgres@localhost:5433/test_placeholder';
process.env.JWT_SECRET ??= 'jest-test-secret-do-not-use-outside-tests';
