import db from "./db";
import doesUserExist from "./doesUserExist";

export default async function unshareReminder(userid: string, reminderId: string, targetUser: string) {
    if (!await doesUserExist(userid)) {
        throw new Error("User does not exist");
    } else if (!await doesUserExist(targetUser)) {
        throw new Error("Target user does not exist");
    } else {
        if ((await db.query("SELECT * FROM reminders WHERE userid = $1 AND reminderid = $2 AND $3 = ANY(sharedWith)", [userid, reminderId, targetUser])).rows.length === 0) {
            throw new Error("Reminder is not shared with the target user");
        } else {
            await db.query("UPDATE reminders SET sharedWith = array_remove(sharedWith, $1) WHERE userid = $2 AND reminderid = $3", [targetUser, userid, reminderId]);
        }
    }
}