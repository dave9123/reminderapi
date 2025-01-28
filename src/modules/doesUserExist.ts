import db from "./db";

export default async function doesUserExist(userid: string) {
    if (userid === undefined) throw new Error("User ID is required");
    const user = await db.query("SELECT * FROM users WHERE userid = $1", [ userid ]);
    return user.rows.length > 0;
}