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
    console.time("Database schema loading time");

    await pool.query(`CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        userid TEXT NOT NULL,
        username TEXT NOT NULL,
        email TEXT NOT NULL,
        password TEXT NOT NULL,
        lastUsed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        createdOn TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`);

    await pool.query(`CREATE TABLE IF NOT EXISTS reminders (
        id SERIAL PRIMARY KEY,
        userid TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        time TIMESTAMP,
        color TEXT,
        priority TEXT,
        tags TEXT[],
        sharedWith TEXT[],
        createdOn TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`);

    await pool.query(`CREATE TABLE IF NOT EXISTS sessions (
        id SERIAL PRIMARY KEY,
        userid TEXT NOT NULL,
        token TEXT NOT NULL,
        isValid BOOLEAN NOT NULL DEFAULT TRUE,
        lastUsed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        createdOn TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`);

    await pool.query(`CREATE TABLE IF NOT EXISTS subscriptions (
        id SERIAL PRIMARY KEY,
        userid TEXT NOT NULL,
        target TEXT NOT NULL,
        type TEXT NOT NULL,
        getSharedWith BOOLEAN NOT NULL DEFAULT FALSE,
        createdOn TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`);

    await pool.query(`CREATE TABLE IF NOT EXISTS firedSubscriptions (
        id SERIAL PRIMARY KEY,
        subscriptionid INTEGER NOT NULL,
        reminderid INTEGER NOT NULL,
        successful BOOLEAN NOT NULL DEFAULT FALSE,
        firedOn TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`);

    console.timeEnd("Database schema loading time");
})();

export default pool;