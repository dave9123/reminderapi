import doesUserExist from "./doesUserExist";
import db from "./db";
import { v4 as uuidv4 } from "uuid";
import { parseDate } from "chrono-node"

interface ReminderData {
    userid: string;
    title: string;
    description: string;
    time: string;
    repeat?: boolean;
    color?: string;
    priority?: string;
    tags?: string[];
    sharedWith?: string[];
    [key: string]: any;
}


const requiredBody = ["userid", "title"];
const optionalBody = ["description", "time", "priority", "color", "tags", "sharedWith"];

export default async function addReminder(body: ReminderData) {
    if (!await doesUserExist(body.userid)) {
        throw new Error("User does not exist");
    } else if (requiredBody.some((key) => !body[key])) {
        throw new Error("Missing required fields");
    } else {
        let values = [];
        let columns = [];
        if (body.time) {
            const time = parseDate(
                body.time,
                new Date(),
                {
                    forwardDate: true
                }
            );
            if (time) {
                columns.push("time");
                values.push(time.toISOString());
            }
        }
        if (body.repeat) {
            columns.push("repeat");
            values.push(body.repeat);
        }
        if (body.color) {
            columns.push("color");
            values.push(body.color);
        }
        if (body.priority) {
            columns.push("priority");
            values.push(body.priority);
        }
        if (body.tags) {
            columns.push("tags");
            values.push(body.tags);
        }
        if (body.sharedWith) {
            columns.push("sharedWith");
            values.push(body.sharedWith);
        }
        let reminderid = uuidv4();
        while ((await db.query("SELECT reminderid FROM reminders WHERE reminderid = $1", [body.reminderid])).rows.length > 0) {
            reminderid = uuidv4();
        }
        columns.push("reminderid");
        values.push(reminderid);
        columns.push("userid");
        values.push(body.userid);
        columns.push("title");
        values.push(body.title);
        columns.push("description");
        values.push(body.description);
        await db.query(`INSERT INTO reminders (${columns.join(", ")}) VALUES (${columns.map((_, i) => `$${i + 1}`).join(", ")})`, values);
        return reminderid;
    }
}