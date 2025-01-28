import doesUserExist from "./doesUserExist";
import db from "./db";

export default async function removeReminder(userid: string, reminderId: string) {
    if (!await doesUserExist(userid)) {
        throw new Error("User does not exist");
    } else {
        await db.query("DELETE FROM reminders WHERE userid = $1 AND id = $2", [ userid, reminderId ]);
    }
};