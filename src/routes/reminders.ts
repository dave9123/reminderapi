import express from "express";
const router = express.Router();

router.get("/user/generate", async (req, res) => {
    try {
        res.json({ userid: await require("../modules/generateUser.ts")() });
    } catch (error) {
        console.error("An error occurred while generating a user:", error);
        res.status(500).json({ error: "An error occurred while generating a user" });
    }
});

router.use(express.json());

router.use(function (req, res, next) {
    if (!req.body.userid) {
        res.status(400).json({ error: "User ID is required" });
        return;
    }
    next();
});

router.get("/reminders", async (req, res) => {
    try {
        res.json(await require("../modules/getReminders")(req.body.userid, req.body.page, req.body.showPerPage));
    } catch (error) {
        console.error("An error occurred while getting reminders:", error);
        res.status(500).json({ error: "An error occurred while getting reminders" });
    }
});

router.post("/reminder/add", async (req, res) => {
    try {
        const { userid, title, description, time } = req.body;
        await require("../modules/addReminder")(userid, title, description, time);
        res.json({ message: "Reminder added successfully" });
    } catch (error) {
        console.error("An error occurred while adding a reminder:", error);
        res.status(500).json({ error: "An error occurred while adding a reminder" });
    }
});

router.post("/reminder/remove", async (req, res) => {
    try {
        const { userid, reminderId } = req.body;
        await require("../modules/removeReminder")(userid, reminderId);
        res.json({ message: "Reminder removed successfully" });
    } catch (error) {
        console.error("An error occurred while removing a reminder:", error);
        res.status(500).json({ error: "An error occurred while removing a reminder" });
    }
});

router.post("/reminder/modify", async (req, res) => {
    try {
        const { userid, reminderId, data } = req.body;
        await require("../modules/modifyReminder")(userid, reminderId, data);
        res.json({ message: "Reminder modified successfully" });
    } catch (error) {
        console.error("An error occurred while modifying a reminder:", error);
        res.status(500).json({ error: "An error occurred while modifying a reminder" });
    }
});

router.post("/user/delete", async (req, res) => {
    try {
        const { userid } = req.body;
        await require("../modules/deleteUser")(userid);
        res.json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("An error occurred while deleting a user:", error);
        res.status(500).json({ error: "An error occurred while deleting a user" });
    }
});

export default router;