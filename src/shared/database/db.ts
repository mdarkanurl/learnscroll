import { drizzle } from 'drizzle-orm/node-postgres';
import { env } from '#configs';

export const db = drizzle(env.databaseUrl);
