import db from "./db.ts";

export default async function addReminder(userid: number, title: string, description: string, time: string) {
    await db.connect();
    await db.query("SELECT user_id FROM users WHERE user_id = $1", userid);
    if (!userid) {
        await db.release();
        throw new Error("User not found");
    } else {
        await db.query("INSERT INTO reminders (uid, title, description reminder, time) VALUES ($1, $2, $3)", userid, title, description, time);
    }
    await db.release();
};