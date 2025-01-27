import db from "./db";
import doesUserExist from "./doesUserExist";

export default async function removeReminder(userid: string, reminderId: string) {
    if (!doesUserExist(userid)) {
        throw new Error("User does not exist");
    } else {
        await db.connect();
        await db.query("DELETE FROM reminders WHERE user_id = $1 AND id = $2", userid, reminderId);
        await db.release();
    }
};