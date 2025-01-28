import { v4 as uuidv4 } from "uuid";
import db from "./db";

export default async function generateUser() {
    const userid = uuidv4();
    await db.query("INSERT INTO users (userid) VALUES ($1)", [ userid ]);
    return userid;
}