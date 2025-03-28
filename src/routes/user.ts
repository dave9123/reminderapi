import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import db from "../modules/db";
import checkAuthorization from "../modules/checkAuthorization";
import checkRequiredField from "../modules/checkRequiredField";
import { randomUUID } from "crypto";
dotenv.config();
const router = express.Router();

router.post("/signup", async (req, res) => {
    const requiredFields = ["username", "email", "password"];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    try {
        const body = await checkRequiredField(requiredFields, req, res);
        if (!body) return;
        if (!body.email || !emailRegex.test(body.email)) {
            res.status(400).json({ message: "Invalid email" });
            return;
        }
        if (!body.username || !usernameRegex.test(body.username)) {
            res.status(400).json({ message: "Invalid username" });
            return;
        }
        if (!body.password) {
            res.status(400).json({ message: "Invalid password" });
            return;
        }
        const user = (await db.query("SELECT * FROM users WHERE email = $1 OR username = $2", [body.email, body.username])).rows[0];
        if (user) {
            res.status(409).json({ message: "User already exists" });
            return;
        }
        var userid: string;
        do {
            userid = randomUUID();
        }
        while ((await db.query("SELECT * FROM users WHERE userid = $1", [userid])).rows.length > 0);
        await bcrypt.hash(body.password, 10, async (err, hash) => {
            if (err) {
                res.status(500).json({ message: "Internal Server Error" });
                console.error("An error occured while comparing the passwords:", err);
                return;
            }
            await db.query("INSERT INTO users (username, email, password, userid) VALUES ($1, $2, $3, $4)", [body.username, body.email, hash, userid]);
        });
        res.status(200).json({ message: "User created successfully" });
    } catch (error) {
        console.error("An error occured while creating a user", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.delete("/delete", async (req, res) => {
    const requiredFields = ["password"];
    try {
        const body = await checkRequiredField(requiredFields, req, res);
        if (!body) return;
        const auth = await checkAuthorization(req, res);
        if (!auth) return;
        const hashedPassword = (await db.query("SELECT password FROM users WHERE id = $1", [auth.userid])).rows[0].password;
        await bcrypt.compare(body.password, hashedPassword, async (err, same) => {
            if (err) {
                res.status(500).json({ message: "Internal Server Error" });
                console.error("An error occured while comparing the passwords:", err);
                return;
            }
            if (!same) {
                res.status(401).json({ message: "Invalid password" });
            }
            await db.query("DELETE FROM users WHERE userid = $1", [auth.userid]);
            await db.query("DELETE FROM sessions WHERE userid = $1", [auth.userid]);
            await db.query("DELETE FROM reminders WHERE userid = $1", [auth.userid]);
            await db.query("DELETE FROM subscriptions WHERE userid = $1", [auth.userid]);
            await db.query("DELETE FROM firedSubscriptions WHERE userid = $1", [auth.userid]);
            res.status(200).json({ message: "User deleted successfully" });
        });
    } catch (error) {
        console.error("An error occured while deleting a user", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.post("/login", async (req, res) => {
    const requiredFields = ["user", "password"];
    try {
        const body = await checkRequiredField(requiredFields, req, res);
        if (!body) return;
        const users = (await db.query("SELECT userid,password FROM users WHERE email = $1 OR username = $1", [body.user])).rows;
        if (users.length === 0) {
            res.status(401).json({ message: "Invalid email/username or password" });
            return;
        }
        bcrypt.compare(body.password, users[0].password, async (err, same) => {
            if (err) {
                res.status(500).json({ message: "Internal Server Error" });
                console.error("An error occured while comparing the passwords:", err);
                return;
            }
            if (!same) {
                res.status(401).json({ message: "Invalid email or password" });
            }
            var session: string | undefined
            do {
                session = await jwt.sign({ userid: users[0].userid, session: randomUUID() }, process.env.JWT_SECRET || "");
            }
            while ((await db.query("SELECT * from sessions WHERE token = $1", [session])).rows.length > 0);
            await db.query("INSERT INTO sessions (userid, token) VALUES ($1, $2)", [users[0].userid, session]);
            res.status(200).json({ userid: users[0].userid, token: session });
        });
    } catch (error) {
        console.error("An error occured while logging in a user", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.get("/logout", async (req, res) => {
    try {
        const auth = await checkAuthorization(req, res);
        if (!auth) return;
        await db.query("UPDATE sessions SET isValid = FALSE WHERE token = $1", [auth.session]);
        res.status(200).json({ message: "User logged out successfully" });
    } catch (error) {
        console.error("An error occured while logging out a user", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.get("/sessions", async (req, res) => {
    try {
        const auth = await checkAuthorization(req, res);
        if (!auth) return;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const offset = (page - 1) * limit;
        const sessions = (await db.query("SELECT * FROM sessions WHERE userid = $1 AND isValid = TRUE LIMIT $2 OFFSET $3", [auth.userid, limit, offset])).rows;
        const totalSessions = (await db.query("SELECT COUNT(*) FROM sessions WHERE userid = $1 AND isValid = TRUE", [auth.userid])).rows[0].count;
        res.status(200).json({
            sessions,
            page,
            limit,
            totalSessions,
            totalPages: Math.ceil(totalSessions / limit)
        });
    } catch (error) {
        console.error("An error occured while fetching sessions", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.post("/session/delete", async (req, res) => {
    const requiredFields = ["session", "password"];
    try {
        const body = await checkRequiredField(requiredFields, req, res);
        if (!body) return;
        const auth = await checkAuthorization(req, res);
        if (!auth) return;
        const hashedPassword = (await db.query("SELECT password FROM users WHERE id = $1", [auth.userid])).rows[0].password;
        await bcrypt.compare(body.password, hashedPassword, async (err, same) => {
            if (err) {
                throw new Error("An error occured while comparing the passwords");
            }
            if (!same) {
                res.status(401).json({ message: "Invalid password" });
            }
            await db.query("UPDATE sessions SET isValid = FALSE WHERE token = $1", [body.session]);
            res.status(200).json({ message: "Session deleted successfully" });
        });
    } catch (error) {
        console.error("An error occured while deleting a session", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

export default router;