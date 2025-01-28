import { Pool } from "pg";
import dotenv from "dotenv";
dotenv.config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || "5432"),
});

(async () => {
    await pool.query(`CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        userid TEXT NOT NULL,
        createdOn TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedOn TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS reminders (
        id SERIAL PRIMARY KEY,
        reminderid TEXT NOT NULL,
        userid TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        time TEXT NOT NULL,
        repeat TEXT NOT NULL,
        color TEXT NOT NULL,
        tags TEXT[],
        sharedWith TEXT[],
        createdOn TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedOn TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
    
})();

export default pool;