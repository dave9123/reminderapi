import doesUserExist from "./doesUserExist";
import db from "./db";

export default async function modifyReminder(userid: string, reminderId: string, data: ReminderData) {
    if (!await doesUserExist(userid)) {
        throw new Error("User does not exist");
    } else {
        await db.query("UPDATE reminders SET title = $1, description = $2, time = $3 WHERE userid = $4 AND id = $5", [ data.title, data.description, data.time, userid, reminderId ]);
    }
}