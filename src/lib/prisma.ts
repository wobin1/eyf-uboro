import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

function createPrismaClient() {
  let connectionString = process.env.DATABASE_URL ?? "";

  if (!connectionString.includes("uselibpqcompat=")) {
    const separator = connectionString.includes("?") ? "&" : "?";
    connectionString += `${separator}uselibpqcompat=true`;
  }

  if (!globalForPrisma.pool) {
    globalForPrisma.pool = new Pool({
      connectionString,
      ssl: process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : false, // ← disable SSL locally
      max: 3,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
    });
  }

  const adapter = new PrismaPg(globalForPrisma.pool);
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;