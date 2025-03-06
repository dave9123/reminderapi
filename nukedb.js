const { Pool } = require('pg');
require("dotenv").config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || "5432"),
    ssl: process.env.DB_SSL == "true" ? { rejectUnauthorized: false } : false
});

tables = ["users", "reminders", "sessions", "subscriptions", "firedSubscriptions"]
triggers = ["update_reminders_modtime"]
functions = ["update_modifiedReminder_column()"]

for (let table of tables) {
    pool.query(`DROP TABLE IF EXISTS ${table};`)
        .then(res => console.log(`Table ${table} dropped`))
        .catch(err => console.error(err));
}
for (let trigger of triggers) {
    pool.query(`DROP TRIGGER IF EXISTS ${trigger} ON reminders;`)
        .then(res => console.log(`Trigger ${trigger} dropped`))
        .catch(err => console.error(err));
}
for (let func of functions) {
    pool.query(`DROP FUNCTION IF EXISTS ${func};`)
        .then(res => console.log(`Function ${func} dropped`))
        .catch(err => console.error(err));
}