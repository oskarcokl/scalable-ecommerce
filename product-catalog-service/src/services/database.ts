import dotenv from 'dotenv';
import path from 'path';
import { drizzle } from 'drizzle-orm/node-postgres';

// TODO: Make this different between dev and production
dotenv.config({
    path: path.resolve(__dirname, '../../.env.development'),
});

const name = process.env.DB_NAME;
const host = process.env.DB_HOST;
const port = process.env.DB_PORT;
const user = process.env.DB_USER;
const password = process.env.DB_PASSWORD;
const dbUrl = `postgresql://${user}:${password}@${host}:${port}/${name}`;
// TODO: maybe panic if these values cant be read or are undefined

// TODO: Maybe test the connection somehow?
const db = drizzle({
    connection: dbUrl,
    casing: 'snake_case',
});
export default db;
