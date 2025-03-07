import express from "express";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import db from "../modules/db";
import checkAuthorization from "../modules/checkAuthorization";
import checkRequiredField from "../modules/checkRequiredField";
const router = express.Router();

router.post("/signup", async (req, res) => {
    const requiredFields = ["username", "email", "password"];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    try {
        const body = await checkRequiredField(requiredFields, req, res);
        if (!emailRegex.test(body.email)) {
            res.status(400).json({ message: "Invalid email" });
            return;
        }
        if (!usernameRegex.test(body.username)) {
            res.status(400).json({ message: "Invalid username" });
            return;
        }
        const user = (await db.query("SELECT * FROM users WHERE email = $1 OR username = $2", [body.email, body.username])).rows[0];
        if (user) {
            res.status(409).json({ message: "User already exists" });
            return;
        }
        await bcrypt.hash(body.password, 10, async (err, hash) => {
            if (err) {
                throw new Error("An error occured while hashing the password");
            }
            await db.query("INSERT INTO users (username, email, password) VALUES ($1, $2, $3)", [body.username, body.email, hash]);
        });
        res.status(200).json({ message: "User created successfully" });
    } catch (error) {
        console.error("An error occured while creating a user", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.post("/delete", async (req, res) => {
    const requiredFields = ["password"];
    try {
        const body = await checkRequiredField(requiredFields, req, res);
        const auth = await checkAuthorization(req, res);
        const hashedPassword = (await db.query("SELECT password FROM users WHERE id = $1", [auth.userid])).rows[0].password;
        await bcrypt.compare(body.password, hashedPassword, async (err, same) => {
            if (err) {
                throw new Error("An error occured while comparing the passwords");
            }
            if (!same) {
                res.status(401).json({ message: "Invalid password" });
            }
            await db.query("DELETE FROM users WHERE id = $1", [auth.userid]);
            await db.query("UPDATE sessions SET isValid = FALSE WHERE token = $1", [auth.session]);
            await db.query("DELETE FROM reminders WHERE userid = $1", [auth.userid]);
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
        const users = (await db.query("SELECT * FROM users WHERE email = $1 OR username = $1", [body.user])).rows;
        if (users.length === 0) {
            res.status(401).json({ message: "Invalid email/username or password" });
            return;
        }
        await bcrypt.compare(body.password, users[0].password, async (err, same) => {
            if (err) {
                throw new Error("An error occured while comparing the passwords");
            }
            if (!same) {
                res.status(401).json({ message: "Invalid email or password" });
            }
            const session = uuidv4();
            await db.query("INSERT INTO sessions (userid, token) VALUES ($1, $2)", [users[0].id, session]);
            res.status(200).json({ userid: users[0].id, session });
        });
    } catch (error) {
        console.error("An error occured while logging in a user", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.get("/logout", async (req, res) => {
    try {
        const auth = await checkAuthorization(req, res);
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
        const sessions = (await db.query("SELECT * FROM sessions WHERE userid = $1 AND isValid = TRUE", [auth.userid])).rows;
        res.status(200).json(sessions);
    } catch (error) {
        console.error("An error occured while fetching sessions", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.post("/sessions/delete", async (req, res) => {
    const requiredFields = ["session", "password"];
    try {
        const body = await checkRequiredField(requiredFields, req, res);
        const auth = await checkAuthorization(req, res);
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