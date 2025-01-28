import db from "./db";
import doesUserExist from "./doesUserExist";

const requiredBody = ["userid", "reminderId", "data"];

export default async function modifyReminder(userid: string, reminderId: string, data: ReminderData) {
    if (!await doesUserExist(userid)) {
        throw new Error("User does not exist");
    } else {
        var fields = [];
        var values = [];
        var index = 1;

        if (data.title) {
            fields.push(`title = $${index++}`);
            values.push(data.title);
        }
        if (data.description) {
            fields.push(`description = $${index++}`);
            values.push(data.description);
        }
        if (data.time) {
            fields.push(`time = $${index++}`);
            values.push(new Date(data.time));
        }
        if (data.priority) {
            fields.push(`priority = $${index++}`);
            values.push(data.priority);
        }
        if (data.color) {
            fields.push(`color = $${index++}`);
            values.push(data.color);
        }
        if (data.repeat) {
            fields.push(`repeat = $${index++}`);
            values.push(data.repeat);
        }
        if (data.tags) {
            fields.push(`tags = $${index++}`);
            values.push(data.tags);
        }
        if (data.sharedWith) {
            fields.push(`sharedWith = $${index++}`);
            values.push(data.sharedWith);
        }
        if (data.priority) {
            fields.push(`priority = $${index++}`);
            values.push(data.priority);
        }

        if (fields.length > 0) {
            values.push(userid, reminderId);
            const query = `UPDATE reminders SET ${fields.join(", ")} WHERE userid = $${index++} AND reminderid = $${index}`;
            await db.query(query, values);
        }
    }
}