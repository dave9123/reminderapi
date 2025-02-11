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
        username TEXT NOT NULL,
        email TEXT NOT NULL,
        password TEXT NOT NULL,
        createdOn TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedOn TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`);

    await pool.query(`CREATE TABLE IF NOT EXISTS reminders (
        id SERIAL PRIMARY KEY,
        reminderid TEXT NOT NULL,
        userid TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        time TEXT,
        repeat BOOLEAN,
        color TEXT,
        priority TEXT,
        tags TEXT[],
        sharedWith TEXT[],
        createdOn TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedOn TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`);

    await pool.query(`CREATE TABLE IF NOT EXISTS sessions (
        id SERIAL PRIMARY KEY,
        userid TEXT NOT NULL,
        token TEXT NOT NULL,
        valid BOOLEAN NOT NULL,
        createdOn TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`);
    
    await pool.query(`CREATE OR REPLACE FUNCTION update_modifiedReminder_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW."updatedOn" = now();
            RETURN NEW;
        END;
        $$ LANGUAGE 'plpgsql';
    `);

    await pool.query(`DROP TRIGGER IF EXISTS update_reminders_modtime ON reminders;`);

    await pool.query(`CREATE TRIGGER update_reminders_modtime
        BEFORE UPDATE ON reminders
        FOR EACH ROW
        EXECUTE FUNCTION update_modifiedReminder_column();
    `);
})();

export default pool;