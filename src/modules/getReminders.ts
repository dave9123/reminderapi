import doesUserExist from "./doesUserExist";
import db from "./db";
import pagination from "./pagination";

export default async function getReminders(userid: string, page: number, showPerPage: number) {
    if (!await doesUserExist(userid)) {
        throw new Error("User does not exist");
    } else {
        const currentReminders = (await db.query("SELECT * FROM reminders WHERE userid = $1", [ userid ])).rows;
        const sharedReminders = (await db.query("SELECT * FROM reminders WHERE $1 = ANY(sharedWith)", [ userid ])).rows;
        return pagination(page, showPerPage, [ ...currentReminders, ...sharedReminders ]);
    }
}