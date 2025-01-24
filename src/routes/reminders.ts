import express from "express";
const router = express.Router();
import getReminders from "../modules/getReminders.ts";

router.get("/reminders", async (req, res) => {
    try {
        const reminders = await getReminders(req.query.userid);
        res.json(await getReminders(req.query.userid));
    } catch (error) {
        console.error("An error occurred while getting reminders:", error);
        res.status(500).json({ error: "An error occurred while getting reminders" });
    }
});

export default router;