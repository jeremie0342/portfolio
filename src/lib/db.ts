import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

/*
 * Prisma 7 connects through a driver adapter rather than its own engine, so
 * the connection string is handed to node-postgres here instead of being
 * read from the schema.
 */
function createClient() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not set.");
  }

  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}

/*
 * In development the module graph is rebuilt on every change, which would
 * otherwise open a new pool on each reload and exhaust Postgres within a few
 * dozen edits. Pinning the instance to the global object outlives those
 * reloads.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
