import express from "express";
import db from "../modules/db";
import checkAuthorization from "../modules/checkAuthorization";
import checkRequiredField from "../modules/checkRequiredField";
const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const userid = await checkAuthorization(req, res);
        const reminders = (await db.query("SELECT * FROM reminders WHERE userid = $1 OR $1 = ANY(sharedWith)", [userid])).rows;
        res.json(reminders);
    } catch (error) {
        console.error("An error occured while getting reminders", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.post("/add", async (req, res) => {
    const requiredFields = ["title"];
    const optionalFields = ["description", "time", "color", "priority", "tags", "sharedWith"];
    try {
        const userid = await checkAuthorization(req, res);
        const body = checkRequiredField(requiredFields, req, res);
        const optionalFieldsQuery = optionalFields.filter(field => field in body).map((field, index) => `${field}`);
        const optionalFieldsValues = optionalFields.filter(field => field in body).map(field => body[field]);
        const optionalFieldsPlaceholders = optionalFields.filter(field => field in body).map((field, index) => `$${index + 3}`);
        await db.query(`INSERT INTO reminders (userid, title, ${optionalFieldsQuery.join(", ")}) VALUES ($1, $2, ${optionalFieldsPlaceholders.join(", ")})`, [userid, body.title, ...optionalFieldsValues]);
        res.json({ message: "Reminder added successfully" });        
    } catch (error) {
        console.error("An error occured while adding a reminder", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.post("/update/:id", async (req, res) => {
    const optionalFields = ["title", "description", "time", "color", "priority", "tags", "sharedWith"];
    try {
        const userid = await checkAuthorization(req, res);
        const reminder = (await db.query("SELECT * FROM reminders WHERE id = $1", [req.params.id])).rows[0];
        if (reminder.userid !== userid) {
            res.status(403).json({ message: "You are not authorized to update this reminder" });
            return;
        }
        const body = req.body;
        const optionalFieldsQuery = optionalFields.filter(field => field in body).map((field, index) => `${field} = $${index + 2}`);
        const optionalFieldsValues = optionalFields.filter(field => field in body).map(field => body[field]);
        await db.query(`UPDATE reminders SET ${optionalFieldsQuery.join(", ")} WHERE id = $1`, [req.params.id, ...optionalFieldsValues]);
        res.json({ message: "Reminder updated successfully" });
    } catch (error) {
        console.error("An error occured while updating a reminder", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.delete("/delete/:id", async (req, res) => {
    try {
        const userid = await checkAuthorization(req, res);
        const reminder = (await db.query("SELECT * FROM reminders WHERE id = $1", [req.params.id])).rows[0];
        if (reminder.userid !== userid) {
            res.status(403).json({ message: "You are not authorized to delete this reminder" });
            return;
        }
        await db.query("DELETE FROM reminders WHERE id = $1", [req.params.id]);
        res.json({ message: "Reminder deleted successfully" });
    } catch (error) {
        console.error("An error occured while deleting a reminder", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

export default router;