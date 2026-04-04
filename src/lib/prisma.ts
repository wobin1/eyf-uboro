import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

function createPrismaClient() {
  let connectionString = process.env.DATABASE_URL ?? "";

  // Add libpq compatibility flag to suppress pg driver SSL warnings
  if (!connectionString.includes("uselibpqcompat=")) {
    const separator = connectionString.includes("?") ? "&" : "?";
    connectionString += `${separator}uselibpqcompat=true`;
  }

  // Reuse the pool across hot reloads in dev to avoid connection exhaustion
  if (!globalForPrisma.pool) {
    globalForPrisma.pool = new Pool({
      connectionString,
      ssl: {
        // Required for managed databases (e.g. Aiven) that use self-signed certs
        rejectUnauthorized: false,
      },
      // Keep pool small to stay within Aiven free-tier connection limits
      max: 3,
      idleTimeoutMillis: 30_000,    // close idle connections after 30s
      connectionTimeoutMillis: 10_000, // fail fast if no connection available in 10s
    });
  }

  const adapter = new PrismaPg(globalForPrisma.pool);
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
