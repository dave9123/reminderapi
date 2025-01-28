import doesUserExist from "./doesUserExist";
import db from "./db";
import pagination from "./pagination";

export default async function getReminders(userid: string, page: number, showPerPage: number) {
    if (!await doesUserExist(userid)) {
        throw new Error("User does not exist");
    } else {
        const reminders = (await db.query("SELECT * FROM reminders WHERE userid = $1", userid)).rows;
        return pagination(page, showPerPage, reminders);
    }
}