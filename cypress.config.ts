import { defineConfig } from 'cypress';
import { config as loadEnv } from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';

loadEnv();

// Cypress 16 dropped Cypress.env()/cy.env(key) as a way to read a single arbitrary value from
// spec code with a stable, documented type — cy.fixture() did not change, so the reviewer's
// seeded credentials are written here (Node context, reads .env directly) into a fixture file
// specs load with cy.fixture('admin'). Generated, not hand-authored — see .gitignore.
const fixturesDir = path.join(__dirname, 'cypress/fixtures');
fs.mkdirSync(fixturesDir, { recursive: true });
fs.writeFileSync(
  path.join(fixturesDir, 'admin.json'),
  JSON.stringify({ email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD }, null, 2),
);

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    specPattern: 'cypress/e2e/**/*.cy.ts',
    supportFile: 'cypress/support/e2e.ts',
    fixturesFolder: 'cypress/fixtures',
    video: false,
    viewportWidth: 1280,
    viewportHeight: 800,
    // The suite asserts against the deterministic seed, so it must run after `npm run db:reset`.
    retries: { runMode: 1, openMode: 0 },
    // Turbopack (npm run dev) compiles each route on first hit. The very first navigation to a
    // heavy page bundle (e.g. /admin, with MUI + TanStack Query) in a fresh dev server process
    // can exceed the 4s default — this is dev-server compile latency, not app latency.
    defaultCommandTimeout: 10000,
    pageLoadTimeout: 20000,
  },
});
