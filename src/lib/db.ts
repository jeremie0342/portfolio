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
 * Opened on the first query rather than on import.
 *
 * A module that connects when it is loaded makes every file that imports it,
 * however indirectly, require a reachable database at the moment the bundle is
 * evaluated. That includes the build. Deferring it to the first property
 * access means the code can be loaded, analysed and bundled without a
 * database, and the error, when there is one, names the query that wanted it.
 */
function lazy(): PrismaClient {
  return new Proxy({} as PrismaClient, {
    get(_target, property) {
      const client = (globalForPrisma.prisma ??= createClient());
      const value = Reflect.get(client, property);

      return typeof value === "function" ? value.bind(client) : value;
    },
  });
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

export const db = lazy();
