import doesUserExist from "./doesUserExist";
import db from "./db";
import { v4 as uuidv4 } from "uuid";

export default async function addReminder(body: ReminderData) {
    const requiredFields = ["userid", "title", "description", "time"];
    for (const field of requiredFields) {
        if (!body[field]) {
            throw new Error(`${field} is required`);
        }
    }

    if (!await doesUserExist(body.userid)) {
        throw new Error("User does not exist");
    } else {
        let reminderid = uuidv4();
        while ((await db.query("SELECT reminderid FROM reminders WHERE reminderid = $1", [reminderid])).rows.length > 0) {
            reminderid = uuidv4();
        }

        const fields = ["userid", "reminderid", "title", "description", "time"];
        const values = [body.userid, reminderid, body.title, body.description, new Date(body.time)];
        let index = 6;

        if (body.repeat !== undefined) {
            fields.push("repeat");
            values.push(body.repeat);
        }
        if (body.color) {
            fields.push("color");
            values.push(body.color);
        }
        if (body.priority) {
            fields.push("priority");
            values.push(body.priority);
        }
        if (body.tags) {
            fields.push("tags");
            values.push(body.tags);
        }
        if (body.sharedWith) {
            fields.push("sharedWith");
            values.push(body.sharedWith);
        }

        const query = `INSERT INTO reminders (${fields.join(", ")}) VALUES (${fields.map((_, i) => `$${i + 1}`).join(", ")})`;
        await db.query(query, values);
        return reminderid;
    }
}