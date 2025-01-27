import db from "./db";

export default async function doesUserExist(userid: string) {
    const user = await db.query("SELECT * FROM users WHERE user_id = $1", userid);
    return user.rows.length > 0;
}