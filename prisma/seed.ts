import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
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
  const adminEmail = requireEnv('ADMIN_EMAIL');
  const adminPassword = requireEnv('ADMIN_PASSWORD');

  // Hashed at seed time from configuration — no plaintext or hash is ever committed.
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: { passwordHash },
    create: { email: adminEmail, passwordHash },
  });
  console.log(`Admin ready: ${admin.email}`);

  for (const product of products) {
    const saved = await prisma.product.upsert({
      where: { slug: product.slug },
      update: product,
      create: product,
    });
    console.log(`Product ready: ${saved.slug} (${saved.status})`);
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
