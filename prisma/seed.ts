import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Admin
  await prisma.user.upsert({
    where: { email: "admin@eyf.com" },
    update: {},
    create: {
      email: "admin@eyf.com",
      passwordHash: await bcrypt.hash("admin123", 12),
      name: "Admin User",
      role: "ADMIN",
    },
  });

  // Bouncer
  await prisma.user.upsert({
    where: { email: "bouncer@eyf.com" },
    update: {},
    create: {
      email: "bouncer@eyf.com",
      passwordHash: await bcrypt.hash("bouncer123", 12),
      name: "Door Bouncer",
      role: "BOUNCER",
    },
  });

  // Invitee
  await prisma.user.upsert({
    where: { email: "invitee@eyf.com" },
    update: {},
    create: {
      email: "invitee@eyf.com",
      passwordHash: await bcrypt.hash("invitee123", 12),
      name: "Test Invitee",
      role: "INVITEE",
    },
  });

  console.log("✅ All test users created");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });