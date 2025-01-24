import db from "./db.ts";
import doesUserExist from "./doesUserExist.ts";

export default async function getReminders(userid: string) {
    if (!doesUserExist(userid)) {
        throw new Error("User does not exist");
    } else {
        await db.connect();
        const reminders = await db.query("SELECT * FROM reminders WHERE user_id = $1", userid);
        await db.release();
        return reminders.rows;
    }
}