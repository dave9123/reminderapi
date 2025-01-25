import db from "./db";
import doesUserExist from "./doesUserExist";

export default async function addReminder(userid: string, title: string, description: string, time: string) {
    if (!doesUserExist(userid)) {
        throw new Error("User does not exist");
    } else {
        await db.connect();
        await db.query("INSERT INTO reminders (user_id, title, description, time) VALUES ($1, $2, $3, $4)", userid, title, description, time);
        await db.release();
    }
};