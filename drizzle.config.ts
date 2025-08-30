import { defineConfig } from 'drizzle-kit';

// This configuration is used by the Drizzle Kit CLI to manage database schema migrations.
// It requires the DATABASE_URL environment variable to be set to your Neon connection string.
export default defineConfig({
  dialect: 'postgresql',
  schema: './db/schema.ts',
  out: './drizzle',
  dbCredentials: {
    // The connection string is loaded from environment variables for security.
    url: process.env.DATABASE_URL!,
  },
});
