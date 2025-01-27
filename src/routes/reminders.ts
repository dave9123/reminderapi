import express from "express";
const router = express.Router();
import getReminders from "../modules/getReminders";
import addReminder from "../modules/addReminder"
import removeReminder from "../modules/removeReminder";
import modifyReminder from "../modules/modifyReminder";
import generateUser from "../modules/generateUser";

router.get("/reminders", async (req, res) => {
    try {
        res.json(await getReminders(req.body.userid, req.body.page, req.body.showPerPage));
    } catch (error) {
        console.error("An error occurred while getting reminders:", error);
        res.status(500).json({ error: "An error occurred while getting reminders" });
    }
});

router.post("/reminder/add", async (req, res) => {
    try {
        const { userid, title, description, time } = req.body;
        await addReminder(userid, title, description, time);
        res.json({ message: "Reminder added successfully" });
    } catch (error) {
        console.error("An error occurred while adding a reminder:", error);
        res.status(500).json({ error: "An error occurred while adding a reminder" });
    }
});

router.post("/reminder/remove", async (req, res) => {
    try {
        const { userid, reminderId } = req.body;
        await removeReminder(userid, reminderId);
        res.json({ message: "Reminder removed successfully" });
    } catch (error) {
        console.error("An error occurred while removing a reminder:", error);
        res.status(500).json({ error: "An error occurred while removing a reminder" });
    }
});

router.post("/reminder/modify", async (req, res) => {
    try {
        const { userid, reminderId, data } = req.body;
        await modifyReminder(userid, reminderId, data);
        res.json({ message: "Reminder modified successfully" });
    } catch (error) {
        console.error("An error occurred while modifying a reminder:", error);
        res.status(500).json({ error: "An error occurred while modifying a reminder" });
    }
});

router.get("/user/generate", async (req, res) => {
    try {
        res.json({ userid: await generateUser() });
    } catch (error) {
        console.error("An error occurred while generating a user:", error);
        res.status(500).json({ error: "An error occurred while generating a user" });
    }
});

export default router;