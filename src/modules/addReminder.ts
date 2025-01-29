import doesUserExist from "./doesUserExist";
import db from "./db";
import { v4 as uuidv4 } from "uuid";

interface ReminderData {
    userid: string;
    title: string;
    description: string;
    time: string;
    [key: string]: any;
}

const requiredBody = ["userid", "title", "description", "time"];

export default async function addReminder(body: ReminderData) {
    if (!await doesUserExist(body.userid)) {
        throw new Error("User does not exist");
    } else if (requiredBody.some((key) => !body[key])) {
        throw new Error("Missing required fields");
    } else {
        let reminderid = uuidv4();
        while ((await db.query("SELECT reminderid FROM reminders WHERE reminderid = $1", [body.reminderid])).rows.length > 0) {
            reminderid = uuidv4();
        }
        await db.query("INSERT INTO reminders (userid, reminderid, title, description, time) VALUES ($1, $2, $3, $4, $5)", [body.userid, reminderid, body.title, body.description, body.time]);
        return reminderid;
    }
}