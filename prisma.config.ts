import { defineConfig } from "prisma/config";

/**
 * Configuration for the Prisma command line.
 *
 * The schema declares a datasource without a URL, because the application
 * connects through a driver adapter and hands node-postgres the connection
 * string itself. The migration commands have no adapter and no application:
 * they need to be told where the database is, and in Prisma 7 this file is
 * where they look. Without it, `migrate deploy` refuses to run even with
 * `DATABASE_URL` in the environment.
 *
 * `process.env` rather than the `env()` helper the documentation shows: that
 * helper throws when the variable is missing, and this file is loaded by every
 * Prisma command including `generate`, which runs during the image build where
 * there is deliberately no database and no connection string. Reading it
 * directly means the URL is present when a migration needs it and absent,
 * harmlessly, when nothing does.
 */
const url = process.env.DATABASE_URL;

export default defineConfig({
  schema: "prisma/schema.prisma",
  ...(url ? { datasource: { url } } : {}),
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
});
