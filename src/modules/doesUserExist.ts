import db from "./db";

export default async function doesUserExist(userid: string) {
    await db.connect();
    const user = await db.query("SELECT * FROM users WHERE user_id = $1", userid);
    await db.release();
    return user.rows.length > 0;
}