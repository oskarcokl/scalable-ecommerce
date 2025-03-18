import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';

// TODO: Make this different between dev and production
dotenv.config({
    path: path.resolve(__dirname, '../../.env.development'),
});

const db = process.env.DB_NAME;
const host = process.env.DB_HOST;
const port = process.env.DB_PORT;
const user = process.env.DB_USER;
const password = process.env.DB_PASSWORD;

// TODO: maybe panic if these values cant be read or are undefined

const sequelize = new Sequelize(db!, user!, password!, {
    host: host,
    port: parseInt(port!),
    dialect: 'postgres',
});

export const testConnection = async (): Promise<void> => {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully');
    } catch (error) {
        console.error('Unable to connect to database:', error);
    }
};

export default sequelize;
