import { defineConfig } from 'drizzle-kit';
import { env } from '#configs';

export default defineConfig({
  out: './src/shared/database/drizzle',
  schema: './src/shared/database/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: env.databaseUrl,
  },
});
