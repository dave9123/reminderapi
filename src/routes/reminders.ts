import express from "express";
const router = express.Router();
import getReminders from "../modules/getReminders.ts";
import addReminder from "../modules/addReminder.ts";

router.get("/reminders", async (req, res) => {
    try {
        res.json(await getReminders(req.body.userid));
    } catch (error) {
        console.error("An error occurred while getting reminders:", error);
        res.status(500).json({ error: "An error occurred while getting reminders" });
    }
});

router.post("/reminders/add", async (req, res) => {
    try {
        const { userid, title, description, time } = req.body;
        await addReminder(userid, title, description, time);
        res.json({ message: "Reminder added successfully" });
    } catch (error) {
        console.error("An error occurred while adding a reminder:", error);
        res.status(500).json({ error: "An error occurred while adding a reminder" });
    }
});

export default router;