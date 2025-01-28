import doesUserExist from "./doesUserExist";
import db from "./db";

export default async function addReminder(userid: string, title: string, description: string, time: string) {
    if (!await doesUserExist(userid)) {
        throw new Error("User does not exist");
    } else {
        await db.query("INSERT INTO reminders (userid, title, description, time) VALUES ($1, $2, $3, $4)", [ userid, title, description, time ]);
    }
}