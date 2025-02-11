import { v4 as uuidv4 } from "uuid";
import db from "../modules/db";
import bcrypt from "bcrypt";
import express from "express";
const router = express.Router();

interface createUser {
    username: string;
    email: string;
    password: string;
    [key: string]: any;
}

const requiredBody = ["username", "email", "password"];

router.post("/createUser", async (req, res) => {
    try {
        const body: createUser = await req.body;
        if (requiredBody.some((key) => !body[key])) {
            throw new Error("Missing required fields");
        } else {
            if (!/^[a-zA-Z0-9_]{3,20}$/.test(body.username)) {
                res.status(400).json({ error: "Invalid username" });
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
                res.status(400).json({ error: "Invalid email" });
            } else if ((await db.query("SELECT * FROM users WHERE email = $1", [body.email])).rows.length > 0) {
                res.status(400).json({ error: "Email has been used" });
            } else if ((await db.query("SELECT * FROM users WHERE username = $1", [body.username])).rows.length > 0) {
                res.status(400).json({ error: "Username has been used" });
            } else {
                let userid = uuidv4();
                while ((await db.query("SELECT userid FROM users WHERE userid = $1", [userid])).rows.length > 0) {
                    userid = uuidv4();
                }
                await db.query("INSERT INTO users (userid, username, email, password) VALUES ($1, $2, $3, $4)", [userid, body.username, body.email, await bcrypt.hash(body.password, 10)]);
                res.status(200).json({ userid, email: req.body.email, username: req.body.username, message: "User created successfully" });
            }
        }
    } catch (error) {
        console.error("An error occurred while creating a user:", error);
        res.status(500).json({ error: "An error occurred while creating a user" });
    };
});

export default router;