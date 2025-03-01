import express from "express";
import checkAuthorization from "../modules/checkAuthorization";
import checkRequiredField from "../modules/checkRequiredField";
import db from "../modules/db";
const router = express.Router();

const supportedSubscriptions = ["discord-webhook"]

router.post("/add", async (req, res) => {
    const requiredFields = ["type", "target"];
    try {
        const auth = await checkAuthorization(req, res);
        const body = await checkRequiredField(requiredFields, req, res);
        if (body.type && !supportedSubscriptions.includes(body.type)) {
            res.status(400).json({ message: "Invalid subscription type" });
        }
        if ((await db.query("SELECT * FROM subscriptions WHERE userid = $1 AND target = $2 AND type = $3", [auth.userid, body.target, body.type])).rows.length > 0) {
            res.status(400).json({ message: "Already subscribed" });
        }
        await db.query("INSERT INTO subscriptions (userid, target, type) VALUES ($1, $2, $3)", [auth.userid, body.target, body.type]);
        res.json({ message: "Subscribed successfully" });
    } catch (error) {
        console.error("An error occured while subscribing", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.post("/remove", async (req, res) => {
    const requiredFields = ["type", "target"];
    try {
        const auth = await checkAuthorization(req, res);
        const body = await checkRequiredField(requiredFields, req, res);
        await db.query("DELETE FROM subscriptions WHERE userid = $1 AND target = $2 AND type = $3", [auth.userid, body.target, body.type]);
        res.json({ message: "Unsubscribed successfully" });
    } catch (error) {
        console.error("An error occured while unsubscribing", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

export default router;