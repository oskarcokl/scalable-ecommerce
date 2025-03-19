import { defineConfig } from 'drizzle-kit';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({
    path: path.resolve(__dirname, '.env.development'),
});

const name = process.env.DB_NAME;
const host = process.env.DB_HOST;
const port = process.env.DB_PORT;
const user = process.env.DB_USER;
const password = process.env.DB_PASSWORD;
const dbUrl = `postgresql://${user}:${password}@${host}:${port}/${name}`;

export default defineConfig({
    out: './dirzzle',
    schema: './src/db/schema.ts',
    dialect: 'postgresql',
    casing: 'snake_case',
    dbCredentials: {
        url: dbUrl,
    },
});
