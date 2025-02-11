import express from "express";
const router = express.Router();
import * as uuid from "uuid";
import getReminders from "../modules/getReminders";
import addReminder from "../modules/addReminder";
import removeReminder from "../modules/removeReminder";
import modifyReminder from "../modules/modifyReminder";

router.use(express.json());

router.use(function (req, res, next) {
    if (!req.body.userid) {
        res.status(400).json({ error: "User ID is required" });
        return;
    } else if (!uuid.validate(req.body.userid) || uuid.version(req.body.userid) !== 4) {
        res.status(400).json({ error: "Invalid user ID" });
    }
    next();
});

router.get("/reminders", async (req, res) => {
    try {
        res.json(await getReminders(req.body));
    } catch (error) {
        console.error("An error occurred while getting reminders:", error);
        res.status(500).json({ error: "An error occurred while getting reminders" });
    }
});

router.post("/reminder/add", async (req, res) => {
    try {
        res.json({
            reminderId: await addReminder(req.body),
            message: "Reminder added successfully"
        });
    } catch (error) {
        console.error("An error occurred while adding a reminder:", error);
        res.status(500).json({ error: "An error occurred while adding a reminder" });
    }
});

router.post("/reminder/remove", async (req, res) => {
    try {
        const { userid, reminderId } = req.body;
        await removeReminder(userid, reminderId);
        res.json({
            message: "Reminder removed successfully"
        });
    } catch (error) {
        console.error("An error occurred while removing a reminder:", error);
        res.status(500).json({ error: "An error occurred while removing a reminder" });
    }
});

router.post("/reminder/modify", async (req, res) => {
    try {
        const { userid, reminderId, data } = req.body;
        await modifyReminder(userid, reminderId, data);
        res.json({
            message: "Reminder modified successfully"
        });
    } catch (error) {
        console.error("An error occurred while modifying a reminder:", error);
        res.status(500).json({ error: "An error occurred while modifying a reminder" });
    }
});

export default router;