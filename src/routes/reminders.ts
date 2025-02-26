import express from "express";
import db from "../modules/db";
import checkAuthorization from "../modules/checkAuthorization";
import checkRequiredField from "../modules/checkRequiredField";
const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const auth = await checkAuthorization(req, res);
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const offset = (page - 1) * limit;

        const reminders = (await db.query(
            "SELECT * FROM reminders WHERE userid = $1 OR $1 = ANY(sharedWith) LIMIT $2 OFFSET $3",
            [auth.userid, limit, offset]
        )).rows;

        const totalReminders = (await db.query(
            "SELECT COUNT(*) FROM reminders WHERE userid = $1 OR $1 = ANY(sharedWith)",
            [auth.userid]
        )).rows[0].count;

        res.json({
            reminders,
            page,
            limit,
            totalReminders,
            totalPages: Math.ceil(totalReminders / limit)
        });
    } catch (error) {
        console.error("An error occurred while getting reminders", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.post("/add", async (req, res) => {
    const requiredFields = ["title"];
    const optionalFields = ["description", "time", "color", "priority", "tags", "sharedWith"];
    try {
        const auth = await checkAuthorization(req, res);
        const body = checkRequiredField(requiredFields, req, res);
        const optionalFieldsQuery = optionalFields.filter(field => field in body).map(field => `${field}`);
        const optionalFieldsValues = optionalFields.filter(field => field in body).map(field => body[field]);
        const optionalFieldsPlaceholders = optionalFields.filter((_, index) => `$${index + 3}`);
        await db.query(`INSERT INTO reminders (userid, title, ${optionalFieldsQuery.join(", ")}) VALUES ($1, $2, ${optionalFieldsPlaceholders.join(", ")})`, [auth.userid, body["title"], ...optionalFieldsValues]);
        res.json({ message: "Reminder added successfully" });        
    } catch (error) {
        console.error("An error occured while adding a reminder", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.post("/update/:id", async (req, res) => {
    const optionalFields = ["title", "description", "time", "color", "priority", "tags", "sharedWith"];
    try {
        const auth = await checkAuthorization(req, res);
        const reminder = (await db.query("SELECT * FROM reminders WHERE id = $1", [req.params.id])).rows[0];
        if (reminder.userid !== auth.userid) {
            res.status(403).json({ message: "You are not authorized to update this reminder" });
            return;
        }
        const body = await req.body;
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