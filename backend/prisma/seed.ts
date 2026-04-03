import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean existing data
  await prisma.financialRecord.deleteMany();
  await prisma.user.deleteMany();

  const password = await bcrypt.hash('Password123!', 10);

  // Create users
  const admin = await prisma.user.create({
    data: {
      name: 'Alice Admin',
      email: 'admin@finance.dev',
      passwordHash: password,
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });

  const analyst = await prisma.user.create({
    data: {
      name: 'Bob Analyst',
      email: 'analyst@finance.dev',
      passwordHash: password,
      role: 'ANALYST',
      status: 'ACTIVE',
    },
  });

  await prisma.user.create({
    data: {
      name: 'Carol Viewer',
      email: 'viewer@finance.dev',
      passwordHash: password,
      role: 'VIEWER',
      status: 'ACTIVE',
    },
  });

  console.log('✅ Created 3 users (admin, analyst, viewer) — password: Password123!');

  // Seed financial records
  const categories = {
    INCOME: ['Salary', 'Freelance', 'Investment', 'Bonus', 'Rental Income'],
    EXPENSE: ['Food', 'Rent', 'Utilities', 'Travel', 'Healthcare', 'Entertainment', 'Education'],
  };

  const records = [];
  const now = new Date();

  for (let i = 0; i < 60; i++) {
    const type = i % 3 === 0 ? 'INCOME' : 'EXPENSE';
    const cats = categories[type];
    const category = cats[Math.floor(Math.random() * cats.length)];
    const daysAgo = Math.floor(Math.random() * 180); // last 6 months
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);

    const amount =
      type === 'INCOME'
        ? parseFloat((Math.random() * 8000 + 2000).toFixed(2))
        : parseFloat((Math.random() * 2000 + 100).toFixed(2));

    records.push({
      userId: i % 2 === 0 ? admin.id : analyst.id,
      amount,
      type: type as 'INCOME' | 'EXPENSE',
      category,
      date,
      description: `${category} - ${type.toLowerCase()} entry #${i + 1}`,
    });
  }

  await prisma.financialRecord.createMany({ data: records });
  console.log('✅ Created 60 financial records spanning the last 6 months');
  console.log('\n🎉 Seed complete!');
  console.log('\nDemo credentials (all passwords: Password123!):');
  console.log('  Admin   → admin@finance.dev');
  console.log('  Analyst → analyst@finance.dev');
  console.log('  Viewer  → viewer@finance.dev');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
