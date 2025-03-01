import express from "express";
import { v4 as uuidv4 } from "uuid";
import db from "../modules/db";
import checkAuthorization from "../modules/checkAuthorization";
import checkRequiredField from "../modules/checkRequiredField";
const router = express.Router();

router.post("/signup", async (req, res) => {
    const requiredFields = ["username", "email", "password"];
    try {
        const body = await checkRequiredField(requiredFields, req, res);
        const user = (await db.query("SELECT * FROM users WHERE email = $1 OR username = $2", [body.email, body.username])).rows[0];
        if (user) {
            res.status(409).json({ message: "User already exists" });
            return;
        }
        await db.query("INSERT INTO users (username, email, password) VALUES ($1, $2, $3)", [body.username, body.email, body.password]);
        res.json({ message: "User created successfully" });
    } catch (error) {
        console.error("An error occured while creating a user", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.use("/delete", async (req, res) => {
    const requiredFields = ["session"];
    try {
        await checkRequiredField(requiredFields, req, res);
        const auth = await checkAuthorization(req, res);
        db.query("DELETE FROM users WHERE id = $1", [auth.userid]);
        db.query("UPDATE sessions SET isValid = FALSE WHERE token = $1", [auth.session]);
        res.json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("An error occured while deleting a user", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.use("/login", async (req, res) => {
    const requiredFields = ["email", "password"];
    try {
        const body = await checkRequiredField(requiredFields, req, res);
        const { email, password } = body;
        const users = (await db.query("SELECT * FROM users WHERE email = $1 AND password = $2", [email, password])).rows;
        if (users.length === 0) {
            res.status(401).json({ message: "Invalid email or password" });
        }
        const session = uuidv4();
        await db.query("INSERT INTO sessions (userid, token) VALUES ($1, $2)", [users[0].id, session]);
        res.json({ userid: users[0].id, session });
    } catch (error) {
        console.error("An error occured while logging in a user", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.use("/logout", async (req, res) => {
    const requiredFields = ["session"];
    try {
        await checkRequiredField(requiredFields, req, res);
        const auth = await checkAuthorization(req, res);
        await db.query("UPDATE sessions SET isValid = FALSE WHERE token = $1", [auth.session]);
        res.json({ message: "User logged out successfully" });
    } catch (error) {
        console.error("An error occured while logging out a user", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

export default router;