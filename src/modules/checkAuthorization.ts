import { Request, Response } from "express";
import db from "./db";

async function checkAuthorization(req: Request, res: Response): Promise<any> {
    const authHeaderKey = Object.keys(req.headers).find(key => key.toLowerCase() === "authorization");
    const token = authHeaderKey ? (Array.isArray(req.headers[authHeaderKey]) ? req.headers[authHeaderKey][0] : req.headers[authHeaderKey])?.split(" ")[1] : undefined;
    if (!token) {
        res.status(401).json({ message: "Unauthorized" });
    }
    const sessions = (await db.query("SELECT * FROM sessions WHERE token = $1 AND isValid = TRUE", [token])).rows;
    if (sessions.length === 0) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    } else if (sessions.length > 1) {
        throw new Error("Multiple sessions found for the same token");
    }
    db.query("UPDATE sessions SET lastUsed = CURRENT_TIMESTAMP WHERE token = $1", [token]);
    return {userid: sessions[0].userid, session: sessions[0].token};
}

export default checkAuthorization;