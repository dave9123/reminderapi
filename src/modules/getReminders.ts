import db from "./db.ts";

export default async function getReminders(userid: number) {
    await db.connect();
    const reminders = await db.query("SELECT * FROM reminders WHERE user_id = $1", userid);
    await db.release();
    return reminders.rows;
}