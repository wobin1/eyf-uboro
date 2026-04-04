import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  let connectionString = process.env.DATABASE_URL ?? "";

  // Add libpq compatibility flag to suppress pg driver SSL warnings
  if (!connectionString.includes("uselibpqcompat=")) {
    const separator = connectionString.includes("?") ? "&" : "?";
    connectionString += `${separator}uselibpqcompat=true`;
  }

  const pool = new Pool({
    connectionString,
    ssl: {
      // Required for managed databases (e.g. Aiven) that use self-signed certificates
      rejectUnauthorized: false,
    },
  });

  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
