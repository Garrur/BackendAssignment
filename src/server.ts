import './config/env'; // validate env vars first
import app from './app';
import { env } from './config/env';
import { prisma } from './lib/prisma';

const PORT = env.PORT;

async function bootstrap() {
  try {
    // Verify DB connection
    await prisma.$connect();
    console.log('✅ Connected to PostgreSQL (NeonDB)');

    app.listen(PORT, () => {
      console.log(`\n🚀 Finance Backend running on http://localhost:${PORT}`);
      console.log(`📖 Swagger Docs:  http://localhost:${PORT}/api/docs`);
      console.log(`💓 Health Check:  http://localhost:${PORT}/health\n`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    await prisma.$disconnect();
    process.exit(1);
  }
}

bootstrap();

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n⛔ Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
