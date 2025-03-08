import express from "express";
import checkAuthorization from "../modules/checkAuthorization";
import checkRequiredField from "../modules/checkRequiredField";
import db from "../modules/db";
const router = express.Router();

const supportedSubscriptions = ["discord-webhook", "slack-webhook"];

router.get("/", async (req, res) => {
    try {
        const auth = await checkAuthorization(req, res);
        if (!auth) return;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const offset = (page - 1) * limit;
        const subscriptions = (await db.query("SELECT * FROM subscriptions WHERE userid = $1 LIMIT $2 OFFSET $3", [auth.userid, limit, offset])).rows;
        const totalSubscriptions = (await db.query("SELECT COUNT(*) FROM subscriptions WHERE userid = $1", [auth.userid])).rows[0].count;
        res.json({
            subscriptions,
            page,
            limit,
            totalSubscriptions,
            totalPages: Math.ceil(totalSubscriptions / limit)
        });
    } catch (error) {
        console.error("An error occured while getting subscriptions", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.post("/add", async (req, res) => {
    const requiredFields = ["type", "target", "getSharedWith"];
    try {
        const auth = await checkAuthorization(req, res);
        const body = await checkRequiredField(requiredFields, req, res);
        if (body.type && !supportedSubscriptions.includes(body.type)) {
            res.status(400).json({ message: "Invalid subscription type" });
        }
        if ((await db.query("SELECT * FROM subscriptions WHERE userid = $1 AND target = $2 AND type = $3", [auth.userid, body.target, body.type])).rows.length > 0) {
            res.status(400).json({ message: "Already subscribed" });
        }
        await db.query("INSERT INTO subscriptions (userid, target, type, getSharedWith) VALUES ($1, $2, $3, $4)", [auth.userid, body.target, body.type, body.getSharedWith]);
        res.json({ message: "Subscribed successfully" });
    } catch (error) {
        console.error("An error occured while subscribing", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.delete("/remove", async (req, res) => {
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