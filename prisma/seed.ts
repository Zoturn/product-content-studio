import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/lib/auth/password';
import { products } from './seed-data';

const prisma = new PrismaClient();

// Fails fast rather than seeding with `undefined` and failing mysteriously later.
// See .claude/rules/env-and-secrets.md.
function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable ${name}. Set it in .env before seeding.`,
    );
  }
  return value;
}

async function main() {
  // Lowercased at creation, matching the case-insensitive lookup in
  // src/lib/auth/credentials.ts — the seeded account and a login attempt agree on case
  // regardless of how ADMIN_EMAIL happens to be cased in .env.
  const adminEmail = requireEnv('ADMIN_EMAIL').trim().toLowerCase();
  const adminPassword = requireEnv('ADMIN_PASSWORD');

  // Hashed at seed time from configuration — no plaintext or hash is ever committed.
  const passwordHash = await hashPassword(adminPassword);

  const admin = await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: { passwordHash },
    create: { email: adminEmail, passwordHash },
  });
  console.log(`Admin ready: ${admin.email}`);

  // Independent writes to unrelated rows — parallel rather than the sequential round trips a
  // for-of loop would pay.
  const saved = await Promise.all(
    products.map((product) =>
      prisma.product.upsert({
        where: { slug: product.slug },
        update: product,
        create: product,
      }),
    ),
  );
  for (const product of saved) {
    console.log(`Product ready: ${product.slug} (${product.status})`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
