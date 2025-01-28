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
        createdOn TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`);

    await pool.query(`CREATE TABLE IF NOT EXISTS reminders (
        id SERIAL PRIMARY KEY,
        reminderid TEXT NOT NULL,
        userid TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        time TEXT NOT NULL,
        repeat BOOLEAN,
        color TEXT,
        priority TEXT,
        tags TEXT[],
        sharedWith TEXT[],
        createdOn TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedOn TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`);
    
    await pool.query(`CREATE FUNCTION IF NOT EXISTS update_modifiedReminder_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW."updatedOn" = now();
            RETURN NEW;
        END;
        $$ language 'plpgsql';
    `);

    await pool.query(`CREATE TRIGGER IF NOT EXISTS update_reminders_modtime()
        BEFORE UPDATE ON reminders
        FOR EACH ROW
        EXECUTE PROCEDURE update_modified_column();
    `);
})();

export default pool;