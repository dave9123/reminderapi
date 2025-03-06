import { Pool } from "pg";
import dotenv from "dotenv";
dotenv.config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || "5432"),
    ssl: process.env.DB_SSL == "true" ? { rejectUnauthorized: false } : false
});

(async () => {
    pool.query(`CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL,
        email TEXT NOT NULL,
        password TEXT NOT NULL,
        createdOn TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedOn TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`);

    pool.query(`CREATE TABLE IF NOT EXISTS reminders (
        id SERIAL PRIMARY KEY,
        userid TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        time TIMESTAMP,
        color TEXT,
        priority TEXT,
        tags TEXT[],
        sharedWith TEXT[],
        createdOn TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedOn TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`);

    pool.query(`CREATE TABLE IF NOT EXISTS sessions (
        id SERIAL PRIMARY KEY,
        userid TEXT NOT NULL,
        token TEXT NOT NULL,
        isValid BOOLEAN NOT NULL DEFAULT TRUE,
        lastUsed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        createdOn TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`);

    pool.query(`CREATE TABLE IF NOT EXISTS subscriptions (
        id SERIAL PRIMARY KEY,
        userid TEXT NOT NULL,
        target TEXT NOT NULL,
        type TEXT NOT NULL,
        createdOn TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`);

    pool.query(`CREATE TABLE IF NOT EXISTS firedSubscriptions (
        id SERIAL PRIMARY KEY,
        subscriptionid INTEGER NOT NULL,
        reminderid INTEGER NOT NULL,
        successful BOOLEAN NOT NULL DEFAULT FALSE,
        firedOn TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`);

    pool.query(`CREATE OR REPLACE FUNCTION update_modifiedReminder_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW."updatedOn" = now();
            RETURN NEW;
        END;
        $$ LANGUAGE 'plpgsql';
    `);

    pool.query(`CREATE OR REPLACE TRIGGER update_reminders_modtime
        BEFORE UPDATE ON reminders
        FOR EACH ROW
        EXECUTE FUNCTION update_modifiedReminder_column();
    `);
})();

export default pool;