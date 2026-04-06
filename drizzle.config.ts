import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

config();

const url = process.env.COZE_DATABASE_URL ?? process.env.DATABASE_URL;

export default defineConfig({
  schema: './src/storage/database/shared/schema.ts',
  out: './src/storage/database/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: url ?? '',
  },
});
