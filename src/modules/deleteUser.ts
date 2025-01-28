import doesUserExist from "./doesUserExist";
import db from "./db";

const requiredBody = ["userid"];

export default async function deleteUser(userid: string) {
    if (!await doesUserExist(userid)) {
        throw new Error("User does not exist");
    } else {
        await db.query("DELETE FROM reminders WHERE userid = $1", [ userid ]);
        await db.query("DELETE FROM users WHERE userid = $1", [ userid ]);
    }
}