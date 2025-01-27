import db from "./db";
import doesUserExist from "./doesUserExist";

export default async function modifyReminder(userid: string, reminderId: string, data: ReminderData) {
    if (!doesUserExist(userid)) {
        throw new Error("User does not exist");
    } else {
        await db.connect();
        await db.query("UPDATE reminders SET title = $1, description = $2, time = $3 WHERE user_id = $4 AND id = $5", data.title, data.description, data.time, userid, reminderId);
        await db.release();
    }
}