import doesUserExist from "./doesUserExist";
import db from "./db";
import pagination from "./pagination";

interface getReminders {
    userid: string;
    page: string;
    showPerPage: string;
    priority?: string;
    tags?: string[];
    sharedWith?: string[];
    isSharedWithMe?: string;
    [key: string]: any;
}

const requiredBody = ["userid"];

export default async function getReminders(body: getReminders): Promise<any> {
    if (!await doesUserExist(body.userid)) {
        throw new Error("User does not exist");
    } else {
        const currentReminders = (await db.query("SELECT * FROM reminders WHERE userid = $1", [ body.userid ])).rows;
        const sharedReminders = (await db.query("SELECT * FROM reminders WHERE $1 = ANY(sharedWith)", [ body.userid ])).rows;
        return pagination(body.page, body.showPerPage, [ ...currentReminders, ...sharedReminders ]);
    }
}