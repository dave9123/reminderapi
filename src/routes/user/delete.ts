import express from "express";
import doesUserExist from "../../modules/doesUserExist";
import db from "../../modules/db";

const router = express.Router();

const requiredBody = ["userid"];

router.post("/delete", async (req, res) => {
    if (requiredBody.some((key) => !req.body[key])) {
        res.status(400).json({ error: "Missing required fields" });
    } else if (!await doesUserExist(req.body.userid)) {
        res.status(400).json({ error: "User does not exist" });
    } else {
        await db.query("DELETE FROM reminders WHERE userid = $1", [ req.body.userid ]);
        await db.query("DELETE FROM users WHERE userid = $1", [ req.body.userid ]);
        res.status(200).json({ message: "User deleted successfully" });
    }
});

export default router;